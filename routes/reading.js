// ./routes/reading.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;
const PIPELINES_REGEXP = /backlog|reading|review/i;
const ISSUEID_REGEXP = /issue\(\d+\)/ig;

module.exports = (app) => {
    app.post('/reading/milestone', (req, res) => {
        const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)
        if (action === 'tracking') {
            fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/board?access_token=${ZENHUB_TOKEN}`)
            .then(function(response){
                return response.json()
            })
            .then(function(data){
                var notified = false;
                data.pipelines.forEach(element => {
                    if (PIPELINES_REGEXP.test(element.name) == true && element.issues.length == 0 && !notified ) {
                        notified = true;
                        fetch(`https://hooks.slack.com/services/T1AMVNN6S/B8FPW9NF6/${SLACK_READINGHUB_TOKEN}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: 'ARTICLES HAVE NOT BEEN DONE' }),
                        })
                        .then(function(response){
                            console.log(response);
                            return response.json();
                        })
                        .then(() => console.info(`[END] notfication ${action} executed`))
                        .catch(err => res.json('error', { error: err }))    
                    }
                })
            })
            .catch(err => res.json('error', { error: err }))
        }else if(action === 'create') {
            fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/milestones?access_token=${GITHUB_TOKEN}`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json'},
                 body: JSON.stringify({ "title": 'Sprint 0', 'description':'', 'due_on': moment().add(6, 'day').toISOString()}),
            })
            .then(function(response){
                console.log(response);
                return response.json();
            })
            .then(() => console.info(`[END] ${action} executed`))
            .catch(err => res.json('error', { error: err }))

            res.json({message: 'milestone created'});
        }else if (action === 'open') {

        }else if (action === 'close') {

        } 
        /// TODO: action=close, check at every friday what I still need to read. "Github"
        /// TODO: action=open, set those issues in backlog a milestone, and update the milestone start date, "Zenhub" + Github"
      }
    );
    app.post('/reading/issues', (req, res) => {
        const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        console.info(req.body);
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)
        if (action === 'archieved') {
            
        }else if (action === 'stared') {
            retrieveIssueData(req, res).then(function(data){
                console.log(data);
            })
        }else if (action === 'reviewed') {

        }else if (action === 'estimate') {

        }else if (action === 'prioritize') {

        }
        /// TODO: action=transfer, move a issue to specice pipeline. "Zenhub"
        /// TODO: action=effort, set estimate to a issue. "Zenhub"
        /// TODO: action=prioritize set labels to a issue. "Github"
        res.json({ message: 'issue updated!' })
      },
    )
}

function retrieveIssueData(req, res){
    const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
    const { action, reqBody } = req.body;
    var issueID = 0;
    if (reqBody !== undefined && reqBody.tags.length > 0){
        reqBody.tags.forEach(element => {
            console.log(element)
            console.log(ISSUEID_REGEXP.test(element));
            //if (ISSUEID_REGEXP.test(element) == true){
                console.log(typeof(element));
                issueID = element.match(/\d+/ig);
                console.log(issueID);
            //}
        })
    }
    res.json({message:"hi"});
    //return  fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${issueID}?access_token=${ZENHUB_TOKEN}`, {
    //    method: 'GET',
    //    headers: { 'Content-Type': 'application/json'}
    // })
    // .then(function(response){
    //     return response.json()
    // }).catch(err => res.json('error', { error: err }))
}