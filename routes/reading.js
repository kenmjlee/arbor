// ./routes/reading.js
require('es6-promise').polyfill();
require('isomorphic-fetch');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;
const PIPELINES_REGEXP = /backlog|reading|review/i;

module.exports = (app) => {
    app.post('/reading/milestone', (req, res) => {
        const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { action, item } = req.body;
        console.info(`[START] ${action} execute`)
        if (action === 'tracking') {
            fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/board?access_token=${ZENHUB_TOKEN}`)
            .then(function(response){
                return response.json()
            })
            .then((data) => {
                    var pipelines = data.pipelines;
                    var notified = false;
                    pipelines.forEach(element => {
                        if (PIPELINES_REGEXP.test(element.name) == true && element.issues.length == 0 && !notified ) {
                            notified = true;
                            return fetch(`https://hooks.slack.com/services/T1AMVNN6S/B8FPW9NF6/${SLACK_READINGHUB_TOKEN}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: 'ARTICLES HAVE NOT BEEN DONE' }),
                            })
                        }
                    })},
                    (e) => res.json(e),
            )
            .then(
                (response) => console.info(`[END] ${action} executed`),
                (e) => res.json(e),
            );
            res.json({ message: 'notification sent'});
        }else if(action === 'create') {
        }

        /// TODO: action=close, check at every friday what I still need to read. "Github"
        /// TODO: action=open, set those issues in backlog a milestone, and update the milestone start date, "Zenhub" + Github"
      }
    );
    app.post('/github/issues', (context, req, res) => {
        /// TODO: action=transfer, move a issue to specice pipeline. "Zenhub"
        /// TODO: action=effort, set estimate to a issue. "Zenhub"
        /// TODO: action=prioritize set labels to a issue. "Github"
        res.json({ message: 'issue updated!' })
      },
    )
}