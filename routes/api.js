'use strict';
const {Issue, Project} = require('../myDB.js');
const {body, validationResult} = require('express-validator');
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filter = req.query;
      let filterKeys = Object.keys(req.query);
    Project.findOne({project_name: project}).populate('issues').select('issues').then(function(result){
      let output = result.issues.filter(item => {
  return filterKeys.every(key => item[key] == filter[key])
      })
      
      return res.json(output)
    
                                                                                                   
    })
      .catch(err=>res.json([]))
    })
    
    .post(
      body('issue_title').trim()
    .isLength({ min: 1 })
    .escape(),
    body('issue_text').trim()
    .isLength({ min: 1 })
    .escape(),
    body('created_by').trim()
    .isLength({ min: 1 })
    .escape(),
    body('assigned_to').optional({ checkFalsy: true })
    .trim()
    .escape(),
    body('status_text').optional({ checkFalsy: true })
    .trim()
    .escape(),
      function (req, res){
      let project = req.params.project;
        
    const error = validationResult(req);
        if(!error.isEmpty()){
          return res.json({ error: 'required field(s) missing'           })
        }

        else{
          
          Issue.create({
    issue_title: req.body.issue_title,
    issue_text: req.body.issue_text,
    created_by: req.body.created_by,
    assigned_to: req.body.assigned_to || "",
    status_text: req.body.status_text || "",
          }).then(result => {
            
        Project.findOne({project_name: project})
          .then(function(item) {
            if(item){
            item.issues.push(result._id)
            item.save().then(doc => console.log("issue saved"))
            }
            else{
             Project.create({
               project_name: project,
               issues: [result._id]
             }).then(doc => console.log("project created and issue saved")) 
            }
            return res.json(result)
            
          })  

          })
          .catch(err => res.json({error: 'Database Error'}))
        }
    })
    
    .put(body('_id').trim()
    .isLength({min: 1})
    .escape(),
    body('issue_title').trim()
    .optional({ checkFalsy: true })
    .escape(),
    body('issue_text').trim()
    .optional({ checkFalsy: true })
    .escape(),
    body('created_by').trim()
    .optional({ checkFalsy: true })
    .escape(),
    body('assigned_to').optional({ checkFalsy: true })
    .trim()
    .escape(),
    body('status_text').optional({ checkFalsy: true })
    .trim()
    .escape(),
      function (req, res){
      let project = req.params.project;
      const errors = validationResult(req);
      if(!errors.isEmpty()){return res.json({ error: 'missing _id' })}
        
        if(!(req.body.issue_title || req.body.issue_text || req.body.created_by || req.body.assigned_to || req.body.open || req.body.status_text)){
          return res.json({ error: 'no update field(s) sent', '_id': req.body._id })
        }
        
        Project.findOne({project_name: project}).select('issues').then(result=>{
      let [id] = result.issues.filter(item => item == req.body._id)
        if(!id){throw new Error("_id not found")}  
          return id;
        }).then(_id=>Issue.findById(_id))
          .then(output=> {
            const issue = new Issue({
    issue_title: req.body.issue_title || output.issue_title,
    issue_text: req.body.issue_text || output.issue_text,
    created_by: req.body.created_by || output.created_by,
    assigned_to: req.body.assigned_to || output.assigned_to,
    created_on: output.created_on,
    open: !req.body.open,
    status_text: req.body.status_text || output.status_text,
     _id: req.body._id     
        })
return issue;
          }).then(update =>{let doc = Issue.findById(req.body._id).exec((err, doc)=>{
            let updateKeys = Object.keys(update)
            updateKeys.forEach(key=> doc[key] = update[key])
                       
             doc.save()
            })
             return res.json({  result: 'successfully updated', '_id': req.body._id })              })
        .catch(err => res.json({error: "could not update", '_id': req.body._id}))

    })

    .delete(body('_id').trim()
    .isLength({min: 1})
    .escape(),
      function (req, res){
      let project = req.params.project;
      const errors = validationResult(req);
  if(!errors.isEmpty()){return res.json({ error: 'missing _id' })}

   Project.findOne({project_name: project}).select('issues').then(result=>{
      let [id] = result.issues.filter(item => item == req.body._id)
        if(!id){throw new Error("_id not found")}  
          return id;
        }).then(_id=>{Issue.deleteOne({_id:_id}).exec((err, doc)=>res.json({ result: 'successfully deleted', '_id': _id }))})
     .catch(err => res.json({error: "could not delete", '_id': req.body._id}))     
      
          
    });
    
};
