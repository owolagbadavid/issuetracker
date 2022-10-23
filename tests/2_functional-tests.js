const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let issueTestId;
suite('Functional Tests', function() {

    test('Create an issue with every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({"issue_title": "mad issues", "issue_text": "its actually bad", "created_by": "Mike", "status_text": "just opened", "assigned_to": "John"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          issueTestId = res.body._id;
          assert.equal(res.body.issue_title, 'mad issues');
          assert.equal(res.body.issue_text, 'its actually bad');
          assert.equal(res.body.created_by, 'Mike');
          assert.equal(res.body.assigned_to, 'John');
          assert.equal(res.body.status_text, 'just opened');
          assert.equal(res.body.open, true);
          done();
        });
    });


  test('Create an issue with only required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({"issue_title": "mad issues", "issue_text": "its actually bad", "created_by": "Mike"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'mad issues');
          assert.equal(res.body.issue_text, 'its actually bad');
          assert.equal(res.body.created_by, 'Mike');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);
          done();
        });
    });


  test('Create an issue with required fields missing', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({"issue_text": "its actually bad", "created_by": "Mike"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });


  test('View issues on a project', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
        res.body.forEach(item=>{
          assert.isObject(item);
          assert.hasAllKeys(item, ["issue_text", "issue_title", "open", "assigned_to", "created_by", "status_text", "_id", "__v", "created_on", "updated_on"])
          assert.isBoolean(item.open);
          assert.isString(item.created_by);
        });
          done();
        });
    });


  test('View issues on a project with one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/test?created_by=Mike')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
        res.body.forEach(item=>{
          assert.isObject(item);
          assert.hasAllKeys(item, ["issue_text", "issue_title", "open", "assigned_to", "created_by", "status_text", "_id", "__v", "created_on", "updated_on"])
          assert.equal(item.created_by, 'Mike');
          assert.isBoolean(item.open);
          assert.isString(item.created_by);
        });
          done();
        });
    });

   test('View issues on a project with multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/test?created_by=Mike&assigned_to=John')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
        res.body.forEach(item=>{
          assert.isObject(item);
          assert.hasAllKeys(item, ["issue_text", "issue_title", "open", "assigned_to", "created_by", "status_text", "_id", "__v", "created_on", "updated_on"])
          assert.equal(item.created_by, 'Mike');
          assert.equal(item.assigned_to, 'John');
          assert.isBoolean(item.open);
          assert.isString(item.created_by);
        });
          done();
        });
    });

  test('Update one field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({'_id':issueTestId, 'created_by':'John'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, issueTestId)
          done();
        });
    });

  test('Update multiple fields on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({'_id':issueTestId, 'created_by':'John', 'assigned_to':'Mike'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, issueTestId)
          done();
        });
    });

  test('Update an issue with missing _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({'created_by':'John'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id')
          done();
        });
    });

test('Update an issue with no fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({'_id':issueTestId})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, issueTestId);
          done();
        });
    });

  
  test('Update an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({'_id':'wrong stuff', 'created_by':'John'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update')
          assert.equal(res.body._id, 'wrong stuff')
          done();
        });
    });

  
  test('Delete an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({'_id':'wrong stuff'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete')
            assert.equal(res.body._id, 'wrong stuff')
          done();
        });
    });

  test('Delete an issue with a missing _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

  test('Delete an issue', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({'_id': issueTestId})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, issueTestId)
          done();
        });
  });
    
});
