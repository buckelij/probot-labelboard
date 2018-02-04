module.exports = (robot) => {
  robot.on('issues.labeled', async context => {
    // context.log(context) // debug

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
      // debugger; // statements don't work? GHE_HOST=ghe-local.test node debug node_modules/probot/bin/probot-run.js -a...

      // get all repo projects from API, because we need the ids
      const repo_projects_res = await context.github.projects.getRepoProjects(
        { owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name })

      // get all columns for all projects
      const columns_res = await Promise.all(repo_projects_res.data.map((p) => {
        return context.github.projects.getProjectColumns({project_id: p.id})
      }))

      // zip the projects and columns maps together, with project names as keys and {column_name: column_id, ...} as value
      // e.g. {"tickets":{"todo":331,"done":332},"meh":{"shrug":333}}
      const repo_project_column_ids = repo_projects_res.data.map((e, i) => {
        return {
          [e.name]: columns_res[i]['data'].map((c) => {
            return {[c.name]: c.id}
          }).reduce((acc, e) => Object.assign(acc, e), {})
        }
      }).reduce((acc, e) => Object.assign(acc, e), {})

      // Find which repo-project-column the tag should be added to
      const target_repo_projects = config[label]['repo']
      if (target_repo_projects) {
        // for each project, see which column this label should go to
        Object.keys(target_repo_projects).forEach((project) => {
          const target_column = target_repo_projects[project]
          // TODO: list project cards in column to see if it's already there. Handle moves.
          context.github.projects.createProjectCard(
            { column_id: repo_project_column_ids[project][target_column],
              content_id: context.payload.issue.id,
              content_type: 'Issue'
            })
        })
      }
    } // end if ( labels.includes(label) )
  })
}
