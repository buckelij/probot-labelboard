# probot-labelboard

> a GitHub App built with [probot](https://github.com/probot/probot) that
> adds or moves labeled Issues to the specified Projects.


## Setup and running as a traditional service

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

See also see the [docs for deployment](https://probot.github.io/docs/deployment/).

This app requires these **Permissions & events** for the GitHub App:

* Single file *Read-only* to `.github/probot-labelboard.yml`
* Issues *Read-only*
* Repository projects *Read & write*
* Subscribe to events: Issues

## Running as an Action

Create your `.github/probot-labelboard.yml` and then create `.github/workflows/probot-labelboard.yml` (set the "uses" SHA to the current base SHA):

```
name: probot-labelboard

on:
  issues:
    types: [labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: buckelij/probot-labelboard@294e2cf
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
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
