// ./routes/github.js

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;

module.exports = (app) => {
    app.post('/github/milestone', (req, res) => {
        res.json({ message: 'milestone updated!' })
      },
    );
    app.post('/github/issues', (req, res) => {
        res.json({ message: 'issue updated!' })
      },
    )
}