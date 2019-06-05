workflow "ci" {
  resolves = [
    "probot-labelboard CI"
  ]
  on = "push"
}

action "probot-labelboard CI" {
  uses = "./.github/actions/ci"
}
