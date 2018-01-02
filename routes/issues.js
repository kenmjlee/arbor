// ./routes/issues.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');
const Issue = require('../models/Issue');
const Pipeline = require('../models/Pipeline');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;
const PIPELINES_REGEXP = /backlog|reading|review/i;
const ISSUEID_REGEXP = /issue\(\d+\)/ig;
const POINT_REGEXP = /point\(\d+\)/ig;

module.exports = (app) => {
    app.post('/reading/issues/transfer', (req, res) => {
        //const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)

        // Get Issue ID from the tag which will use for moving issue.
        try {
            var issueID = getNumber(reqBody, ISSUEID_REGEXP);
        } catch (err) {
            res.status(500);
            res.json({ error: "Wrong Issue Number Format" })
        }
        var targetIssue = null;
        var targetPipeline = null;
        var targetPipelineName = '';
        // Prepare issue and pipeline at the same time
        if (action === 'stared'){
            targetPipelineName = 'Review'
        }else{
            targetPipelineName = "Done"
        }
        Promise.all([retrieveIssueData(req, res, issueID), retrievePipeline(req, res, targetPipelineName)])
            .then(results => {
                targetIssue = results[0];
                console.info("Target Issue");
                console.info(targetIssue);
                targetPipeline = results[1];
                console.info("Target Pipeline");
                console.info(targetPipeline);

                console.info(`[START] show saved Issue`)
                
                // if (targetIssue.pipeline.name === "In Progress" || 
                //         targetIssue.pipeline.name === 'Review') {
                if (targetIssue.pipeline.name !== "New Issues" && 
                    targetIssue.pipeline.name !== 'Done' &&
                    targetIssue.pipeline.name !== 'Closed') {
                        moveIssueBetweenPipeline(req, res, {issueID: issueID, pipelineID: targetPipeline.pipelineID});
                } else {
                        res.status(200).json({ message: "No Issue Need To Be Moved" });
                }
            })
            .catch(err => {
                res.status(500);
                res.json({ error: "Wrong Prepare Issue and Pipeline Process" })
            })
    }),
    app.post('/reading/issues/estimate', (req, res) => {
        //const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { reqBody } = req.body;
        
        var issueID = 0;
        var point = 0;
        try {
            issueID = getNumber(reqBody, ISSUEID_REGEXP);
            point = getNumber(reqBody, POINT_REGEXP);
        } catch (err) {
            res.status(500);
            res.json({ error: "Wrong Number Format" })
        }
        var targetIssue = null;
        
        setEstimateToIssue(req, res, {issueID: issueID, point: point})
        
        .then(function (response) {
            console.info(response.status)
            if (response.status === 200) {
                res.json({ message: 'story point was set' });
            } else {
                throw new Exception(response.json());
            }
        })
        .catch(err => res.status(500).json({ error: err }));
    })
}

function getNumber(src, reg) {
    var retVal = 0;
    if (src !== undefined && src.tags.length > 0) {
        src.tags.split(',').forEach(element => {
            var isAvailable = reg.test(element);
            if (isAvailable) {
                retVal = element.match(reg).toString().match(/\d+/ig);
                console.log(retVal);
                return;
            }
        })
    }
    return retVal;
}

function moveIssueBetweenPipeline(req, res, src) {
    const { ZENHUB_TOKEN } = req.webtaskContext.secrets
    fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${src.issueID}/moves?access_token=${ZENHUB_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_id: src.pipelineID, position: 'bottom' }),
    })
        .then(function (response) {
            console.info(response.status)
            if (response.status >= 200 || response.status <= 300 ) {
                res.json({ message: 'issue move to done' });
            } else {
                throw new Exception(response.json());
            }
        })
        .catch(err => res.status(500).json({ error: err }))
}

function retrieveIssueData(req, res, issueID) {
    const { ZENHUB_TOKEN } = req.webtaskContext.secrets
    return fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${issueID}?access_token=${ZENHUB_TOKEN}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => { return response.json() });
}

function retrievePipeline(req, res, pipelineName) {
    return req.pipelineModel.findOne({ 'pipelineName': pipelineName }).exec();
}

function setEstimateToIssue(req, res, src) {
    const { ZENHUB_TOKEN } = req.webtaskContext.secrets
    return fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/issues/${src.issueID}/estimate?access_token=${ZENHUB_TOKEN}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimate: src.point}),
    })
}
