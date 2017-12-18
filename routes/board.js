// ./routes/milestones.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');
var mongoose = require('mongoose');
const Pipeline = require('../models/Pipeline');
const SiteSetting = require('../models/SiteSetting');

const GITHUB_REPO_OWNER = 'kenmjlee'
const GITHUB_REPO_NAME = 'kenmjlee.github.io'
const GITHUB_REPO_ID = 22687646;

module.exports = (app) => {
    app.post('/reading/board', (req, res) => {
        const { ZENHUB_TOKEN, PASSWORD } = req.webtaskContext.secrets
        const { action, reqBody } = req.body;
        console.info(`[START] ${action} execute`)
        if (action === 'init' && reqBody.password === PASSWORD ) {
            fetch(`https://api.zenhub.io/p1/repositories/${GITHUB_REPO_ID}/board?access_token=${ZENHUB_TOKEN}`)
            .then(function(response){
                return response.json()
            })
            .then(function(src){
                src.pipelines.forEach(element => {
                    var newPipeline = new req.pipelineModel(Object.assign({}, {pipelineID:element.id, pipelineName:element.name}, {createdAt: Date.now()}));
                    newPipeline.save((err, savedPipeline) => {
                        if (err)
                            console.error(err)
                    })
                })
            })
            .catch(err => res.json('error', { error: err }))  
                    
            SiteSetting.saveStorage(req, res, {}, {sprint:0});

            res.json({message: 'data created'});
        }
    })
}