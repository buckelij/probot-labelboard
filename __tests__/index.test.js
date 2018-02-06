test('that we can run tests', () => {
  expect(1 + 2 + 3).toBe(6)
})

jest.mock('request')
const {createRobot} = require('probot')
const app = require('probot-labelboard')
const payload = { 'event': 'issues', 'payload': require('./fixtures/issue.labeled.json') }

describe('probot-labelboard', () => {
  let robot
  let github

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)

    github = {
      auth: {token: '123'},
      repos: {
        getContent: jest.fn().mockReturnValue(Promise.resolve({
          data: { 'content': Buffer.from('bug:\n  repo:\n    tickets: todo').toString('base64') }
        }))
      },
      projects: {
        getRepoProjects: jest.fn().mockReturnValue(Promise.resolve({
          // Whatever the GitHub API should return
          data: [ {'id': 116, 'name': 'tickets'}, {'id': 117, 'name': 'meh'} ]
        })),
        getProjectColumns: jest.fn().mockReturnValue(Promise.resolve({
          data: [ {'id': 331, 'name': 'todo'}, {'id': 332, 'name': 'done'} ]
        })),
        createProjectCard: jest.fn().mockReturnValue(Promise.resolve({})),
        moveProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
    require('request').__setResponse(() => { return {} })
  })

  describe('fetches from api', () => {
    it('fetches config', async () => {
      await robot.receive(payload)
      expect(github.repos.getContent).toHaveBeenCalled()
    })

    it('fetches projects', async () => {
      await robot.receive(payload)
      expect(github.projects.getRepoProjects).toHaveBeenCalled()
      expect(github.projects.getProjectColumns).toHaveBeenCalled()
      expect(github.projects.createProjectCard).toHaveBeenCalled()
    })

    it('creates card', async () => {
      await robot.receive(payload)
      expect(github.projects.createProjectCard).toHaveBeenCalled()
      expect(github.projects.moveProjectCard).not.toHaveBeenCalled()
    })

    it('moves a card', async () => {
      // mock graphql response where issues is already in a column
      const graphqlRes = {
        data: {repositoryOwner: {repository: {issue: {projectCards:
        {edges: [{node: {
          resourcePath: '/buckelij-org/production/projects/1#card-1075',
          column: {project: {name: 'tickets'}}
        }}]}}}}}}
      require('request').__setResponse(() => { return graphqlRes })
      await robot.receive(payload)
      expect(github.projects.moveProjectCard).toHaveBeenCalled()
      expect(github.projects.createProjectCard).not.toHaveBeenCalled()
    })
  })
})
