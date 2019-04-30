test('that we can run tests', () => {
  expect(1 + 2 + 3).toBe(6)
})

const Probot = require('probot').Probot
const myProbotApp = require('probot-labelboard')
const payload = { 'name': 'issues', 'payload': require('./fixtures/issue.labeled.json') }

describe('probot-labelboard', () => {
  let robot
  let github

  beforeEach(() => {
    // Here we create a robot instance
    let probot = new Probot({})
    // Here we initialize the app on the robot instance
    robot = probot.load(myProbotApp)

    github = {
      auth: {token: '123'},
      query: jest.fn(() => Promise.resolve({})),
      repos: {
        getContents: jest.fn(() => Promise.resolve({
          data: { 'content': Buffer.from('bug:\n  repo:\n    tickets: todo').toString('base64') }
        }))
      },
      projects: {
        listForRepo: jest.fn(() => Promise.resolve({
          // Whatever the GitHub API should return
          data: [ {'id': 116, 'name': 'tickets'}, {'id': 117, 'name': 'meh'} ]
        })),
        listColumns: jest.fn(() => Promise.resolve({
          data: [ {'id': 331, 'name': 'todo'}, {'id': 332, 'name': 'done'} ]
        })),
        createCard: jest.fn(() => Promise.resolve({})),
        moveCard: jest.fn(() => Promise.resolve({}))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('fetches from api', () => {
    it('fetches config', async () => {
      await robot.receive(payload)
      expect(github.repos.getContents).toHaveBeenCalled()
    })

    it('fetches projects', async () => {
      await robot.receive(payload)
      expect(github.projects.listForRepo).toHaveBeenCalled()
      expect(github.projects.listColumns).toHaveBeenCalled()
      expect(github.projects.createCard).toHaveBeenCalled()
    })

    it('creates card', async () => {
      await robot.receive(payload)
      expect(github.projects.createCard).toHaveBeenCalled()
      expect(github.projects.moveCard).not.toHaveBeenCalled()
    })

    it('moves a card', async () => {
      // mock graphql response where issues is already in a column
      const graphqlRes = {
        data: {repositoryOwner: {repository: {issue: {projectCards:
        {edges: [{node: {
          resourcePath: '/buckelij-org/production/projects/1#card-1075',
          column: {project: {name: 'tickets'}}
        }}]}}}}}}
      github.query = jest.fn(() => Promise.resolve(graphqlRes))
      await robot.receive(payload)
      expect(github.projects.moveCard).toHaveBeenCalled()
      expect(github.projects.createCard).not.toHaveBeenCalled()
    })
  })
})
