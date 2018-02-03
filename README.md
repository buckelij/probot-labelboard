# probot-labelboard

> a GitHub App built with [probot](https://github.com/probot/probot) that
> adds labeled Issues to the specified Project.


## Setup

```
# Install dependencies
npm install

# Set environment variables
see https://probot.github.io/docs/deployment/#deploy-the-app

# Run the bot
npm start
```

## .github/probot-labelboard.yml

Configuration is pulled from the .github/probot-labelboard.yml in repositories this App is installed on. 

Example configuration:

```
bug:
  repo:
    new tickets: todo
    help: todo

That will add issues labeled with 'bug' to the 'todo'
columns of the 'new tickets' and 'help' repository projects.
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
