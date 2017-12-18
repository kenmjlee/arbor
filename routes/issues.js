// ./routes/milestones.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;
const PIPELINES_REGEXP = /backlog|reading|review/i;
const ISSUEID_REGEXP = /issue\(\d+\)/ig;

module.exports = (app) => {
    app.post('/reading/issues', (req, res) => {
        const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)
        var issueID = getIssueID(reqBody);
        req.issueModel.find({ _id: idParam }, (err, issueToUpdate) => {
            if (!issueToUpdate) {
                retrieveIssueData(req, res).then(function (data) {
                    newIssue = new req.issueModel(Object.assign({}, { githubIssueID: issueID, pipelineID: data.pipeline.name, created_at: Date.now(), updated_at: Date.now()}));
                    newStory.save((err, savedStory) => {
                        issueToUpdate = savedStory;
                        console.info("save a new issue")
                    })
                })
            }
            if (action === 'archieved') {
                if (issueToUpdate.pipelineID === 'In Progress' ){
                    return fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${issueID}/moves?access_token=${ZENHUB_TOKEN}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pipeline_id: 'Done', position: 'bottom' }),
                    })
                    .then(function(response){
                        console.log(response);
                        return response.json();
                    })
                    .then((data) => console.info(`[END] notfication ${action} executed`))
                    .catch(err => res.json('error', { error: err }))  
                }
            } else if (action === 'stared') {

            } else if (action === 'reviewed') {

            } else if (action === 'estimate') {

            } else if (action === 'prioritize') {

            }
        })

        /// TODO: action=transfer, move a issue to specice pipeline. "Zenhub"
        /// TODO: action=effort, set estimate to a issue. "Zenhub"
        /// TODO: action=prioritize set labels to a issue. "Github"
        res.json({ message: 'issue updated!' })
    },
    )
}

function getIssueID(reqBody) {
    var issueID = 0;
    if (reqBody !== undefined && reqBody.tags.length > 0) {
        reqBody.tags.forEach(element => {
            var isIssue = ISSUEID_REGEXP.test(element);
            if (isIssue) {
                issueID = element.match(/\d+/ig);
                console.log(issueID);
                return;
            }
        })
    }
    return issueID;
}

function retrieveIssueData(req, res, issueID) {
    const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
    return fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${issueID}?access_token=${ZENHUB_TOKEN}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function (response) {
        return response.json()
    }).catch(err => res.json('error', { error: err }))
}