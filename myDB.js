require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

const ischema = new Schema({
  issue_title: {type:String, required: true},
  issue_text: {type:String, required: true},
  created_by: {type:String, required: true},
  assigned_to: String,
  status_text: String,
  updated_on: {type: Date, default: Date.now},
  created_on: {type: Date, default: Date.now},
  open: {type: Boolean, default: true},
})
const pschema = new Schema({
  project_name: String,
  issues: [{type: Schema.Types.ObjectId, ref: 'Issue'}],
})

exports.Issue = mongoose.model('Issue', ischema);
exports.Project = mongoose.model('Project', pschema)