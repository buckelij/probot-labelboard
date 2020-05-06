module.exports = (robot) => {
  robot.on('issues.labeled', async context => {
    // context.log(context) // debug
    // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
    const safeGet = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

    // Load config from .github/myapp.yml in the repository
    // e.g.:
    // bug:
    //   repo:
    //     new tickets: todo
    //     help: todo
    //
    // That will add issues labeled with 'bug' to the 'todo'
    // columns of the 'new tickets' and 'help' repository projects.
    const config = await context.config('probot-labelboard.yml')

    const labels = Object.keys(config) // labels we care about
    const label = context.payload.label.name
    if (labels.includes(label)) {
      // get all repo projects from API, because we need the ids
      const repoProjectsRes = await context.github.projects.listForRepo(
        {
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name
        })

      // get all columns for all projects
      const columnsRes = await Promise.all(repoProjectsRes.data.map((p) => {
        return context.github.projects.listColumns({ project_id: p.id })
      }))

      // zip the projects and columns maps together, with project names as keys and {column_name: column_id, ...} as value
      // e.g. {"tickets":{"todo":331,"done":332},"meh":{"shrug":333}}
      const repoProjectColumnIds = repoProjectsRes.data.map((e, i) => {
        return {
          [e.name]: columnsRes[i].data.map((c) => {
            return { [c.name]: c.id }
          }).reduce((acc, e) => Object.assign(acc, e), {})
        }
      }).reduce((acc, e) => Object.assign(acc, e), {})

      // graphql to get cards the issue is in. REST requires iterating over every card.
      const existingColumnsQuery = `
        query existingColumnsQuery($login: String!, $name: String!, $number: Int!){
          repositoryOwner(login:$login) {
            repository(name:$name) {
              issue(number:$number) {
                projectCards(first: 30) {
                  edges { node {
                    resourcePath
                    column {
                      project { name number }
                      resourcePath
                      name
                    }
                  }}
                }
              }
            }
          }
        }
      `

      const existingColumnsRes = safeGet(['data', 'repositoryOwner', 'repository', 'issue', 'projectCards', 'edges'],
        await context.github.graphql(existingColumnsQuery, {
          login: context.payload.repository.owner.login,
          name: context.payload.repository.name,
          number: context.payload.issue.number
        }))

      const existingColumns = await existingColumnsRes || []
      const existingProjectsColumnId = existingColumns.map((edge) => { // {project1: columnID1, project2: columnId2}
        return { [edge.node.column.project.name]: edge.node.resourcePath.split('-').slice(-1)[0] }
      }).reduce((acc, e) => Object.assign(acc, e), {})

      // Find which repo-project-column the tag should be added to
      const targetRepoProjects = config[label].repo
      if (targetRepoProjects) {
        // for each project, see which column this label should go to
        Object.keys(targetRepoProjects).forEach((project) => {
          const targetColumn = targetRepoProjects[project]
          if (Object.keys(existingProjectsColumnId).includes(project)) {
            // attempt moving the card
            context.github.projects.moveCard(
              {
                id: existingProjectsColumnId[project],
                position: 'top',
                column_id: repoProjectColumnIds[project][targetColumn]
              })
          } else {
            // create new card
            context.github.projects.createCard(
              {
                column_id: repoProjectColumnIds[project][targetColumn],
                content_id: context.payload.issue.id,
                content_type: 'Issue'
              })
          }
        })
      }
    } // end if ( labels.includes(label) )
  })
}
