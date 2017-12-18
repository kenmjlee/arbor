// ./routes/milestones.js
require('es6-promise').polyfill();
require('isomorphic-fetch');
var moment = require('moment');
var mongoose = require('mongoose');
const Pipeline = require('../models/pipeline');

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
            .then(function(data){
                data.pipelines.forEach(element => {
                    console.info(element.id + " & " + element.name);
                    req.PipelineModel.create(element, function (err, savedPipeline) {
                        if (err) {
                            res.json({ err: err });
                            return;
                        } else {
                            //res.json({ bar: barCreated });
                        }
                    });
                    //var newPipeline = new req.PipelineModel(Object.assign({}, {pipelineName:element.name, pipelineID:element.id ,created_at: Date.now()}));
                    //console.info(newPipeline);
                    // newPipeline.create((err, newPipeline) => {
                    //     if (err){
                    //         console.log(savedPipeline);
                    //     }else{
                    //         console.error(err);
                    //     }
                    // })
                })
                
                res.json({message: 'data created'});
            })
            .catch(err => res.json('error', { error: err }))  
        }
    })
}