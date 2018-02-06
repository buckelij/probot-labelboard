# probot-labelboard

> a GitHub App built with [probot](https://github.com/probot/probot) that
> adds or moves labeled Issues to the specified Projects.


## Setup

```
# Install dependencies
npm install

# Set environment variables
# https://probot.github.io/docs/deployment/#deploy-the-app
APP_ID=X
WEBHOOK_SECRET=XXX
GHE_HOST=xxx.io
PRIVATE_KEY="$(cat ~/probot-labelboard.2018-01-01.private-key.pem)"


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
```

That will add issues labeled with 'bug' to the 'todo' columns of the 'new tickets' and 'help'
repository projects. Note that the `repo:` keyword is literally `repo:` and not the name of
the repository. This is to distinguish from Organization Projects, which are not yet supported.

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
