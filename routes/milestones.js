// ./routes/milestones.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');
const SiteSetting = require('../models/SiteSetting');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;
const PIPELINES_REGEXP = /backlog|reading|review/i;
const ISSUEID_REGEXP = /issue\(\d+\)/ig;

module.exports = (app) => {
    app.post('/reading/milestones', (req, res) => {
        const { GITHUB_TOKEN, ZENHUB_TOKEN, SLACK_READINGHUB_TOKEN } = req.webtaskContext.secrets
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)
        if (action === 'track') {
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
            source = {} || {url: `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/milestones?direction=desc&access_token=${GITHUB_TOKEN}`};
            
            retrieveLatestMilestone(source)
            .then(function (milestones){
                if (milestones.length > 0){
                    number = milestones[0].number+1;

                    fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/milestones?access_token=${GITHUB_TOKEN}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify({ "title": `Sprint ${number}`, 'description':'', 'due_on': moment().add(6, 'day').toISOString()}),
                     })
                    .then(function(response){
                       console.log(response);
                       return response.json();
                    })
                    .then((src) => {
                        SiteSetting.saveStorage(req, res, {}, {sprint:src.number});
                        console.info(`[END] ${action} executed`)
                    })
                    .catch(err => res.json('error', { error: err }))
       
                    res.json({message: 'milestone created'});
                }
            })
            .catch(err => res.stauts(500).json({ error: err }))

           
        }else if (action === 'open') {
            // the milestone always opened, this block just reset the start date
            let siteSetting = SiteSetting.saveStorage(req, res);
            fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/milestones/${siteSetting.sprint}/${moment()}?access_token=${ZENHUB_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
            })
            .then(function(response){
                if (response.status >=200 && response.status <=300 )
                    return response.json();
                else
                    new Promise.reject(new Error("Update Milestone Error"))
            })
            .then(() => res.json({message: "Milestone Updated"}))
            .catch(err => res.stauts(500).json({ error: err }));

        }else if (action === 'close') {
            let siteSetting = SiteSetting.saveStorage(req, res);
            fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/milestones/${siteSetting.sprint}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ "state": "closed"}),
            })
            .then(function(response){
                if (response.status >=200 && response.status <=300 )
                    return response.json();
                else
                    new Promise.reject(new Error("Close Milestone Error"))
            })
            .then(() => res.json({message: "Milestone Closed"}))
            .catch(err => res.stauts(500).json({ error: err }));
        } 
      }
    );
}

function retrieveLatestMilestone(src){
    return fetch(src.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ "direction": 'desc'}),
    })
    .then(function(response){
        if (response.status >=200 && response.status <=300 )
            return response.json();
        else
            new Promise.reject(new Error("Retrieve Pipeline Error"))
    })
}