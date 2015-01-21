var _ = require("underscore");
var factory = require('AutoFixture');
require('./fixtures')(factory);
var assert = require("assert");
var inflection = require('inflection');

var request = require('supertest'),
  express = require('express');

var chai = require('chai'),
  expect = chai.expect;

//get the express app
var app = require('../app');
app.listen(3000);


var testModels = {};

var testModelRelationships = {};

__TESTMODELRELATIONSHIPS__


__SETUPTESTMODELS__






var getModelInfo = function(e, testModels, callBack) {
  var url = "/" + inflection.pluralize(e.toLowerCase());

  ;
  var ret = {
    name: e,
    model: testModels,
    url: url
  }

  return (null, ret);
}



Object.keys(testModels).forEach(function(e, i, a) {
  //create 10 instances of each model
  var modelName = e;
  for (j = 0; j <= 2; j++) {
    testModels[modelName]
      .push(factory.create(modelName));
  }
});

describe('CRUD test', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    it('testModels populated with autofixture data', function() {
      expect(testModels[e].length).to.not.equal(0);
    });
  });
});


describe('POST create models', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      it('It should create model ' + e + ' Id ' + testModels[e][ee]._id, function(done) {
        var modelName = e;
        var modelInfo = {
          name: e,
          model: testModels[e][ee],
          url: "/" + inflection.pluralize(e.toLowerCase())
        }

        request(app)
          .post(modelInfo.url)
          .send(modelInfo.model)
          .expect(200, done);
      });
    });

  });

});


describe('Get model by ID', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      it('It should get model using ' + e + ' Id ' + testModels[e][ee]._id, function(done) {
        var modelName = e;
        var modelInfo = {
          name: e,
          model: testModels[e][ee],
          url: "/" + inflection.pluralize(e.toLowerCase()) + '/' + testModels[e][ee]._id
        }

        request(app)
          .get(modelInfo.url)
          .expect(function(res) {
            if (res.body._id !== modelInfo.model._id.toString()) {
              throw new Error("Could not retrieve model " + modelName + " " + modelInfo.model._id);
            }
          })
          .expect(200, done);
      });
    });

  });

});

describe('PUT update models', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      it('It should update model ' + e + ' Id ' + testModels[e][ee]._id, function(done) {
        var modelName = e;
        var modelInfo = {
          name: e,
          model: testModels[e][ee],
          url: "/" + inflection.pluralize(e.toLowerCase()) + '/' + testModels[e][ee]._id
        }
        if (testModelRelationships[modelName]) {
          testModelRelationships[modelName].forEach(function(a, b, c) {
            var relationship = a;
            if (relationship.type === 'hasMany') {
              modelInfo.model[relationship.through] = [testModels[relationship.model][ii]._id];
            } else if (relationship.type === 'hasAndBelongsToMany') {
              modelInfo.model[relationship.through] = [testModels[relationship.model][ii]._id];
            } else if (relationship.type === 'belongsTo') {
              var index = 2;
              modelInfo.model[relationship.through] = testModels[relationship.model][ii]._id;
            }
          });
        }
        //console.log('PUT UPDATE', modelInfo.model);
        request(app)
          .put(modelInfo.url)
          .send(modelInfo.model)
          .expect(function(res) {
            //Check relationships Persisted
            if (testModelRelationships[modelName]) {
              testModelRelationships[modelName].forEach(function(a, b, c) {
                var relationship = a;
                if (relationship.type === 'hasMany' || relationship.type === 'hasAndBelongsToMany') {
                  if (modelInfo.model[relationship.through][0].toString() != res.body[relationship.through]) {
                    throw new Error("Relationship update failed for " + modelName + " " +
                      modelInfo.model[relationship.through]);
                  }
                } else if (relationship.type === 'belongsTo') {
                  var index = testModels[relationship.model].length - 1;
                  if (modelInfo.model[relationship.through].toString() != res.body[relationship.through].toString()) {
                    throw new Error("Relationship update failed for " + modelName + " " +
                      modelInfo.model[relationship.through]);
                  }
                  //  console.log('Compare belongs to ' + modelInfo.model[relationship.through].toString() + ' EQUALS '+
                  //res.body[relationship.through].toString());

                }
              });
            }
          })
          .expect(200, done);
      });
    });
  });
});


describe('GET - check model relationships', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      var modelName = e;

      var modelInfo = {
        name: e,
        model: testModels[e][ee],
        url: "/" + inflection.pluralize(e.toLowerCase()) + '/' + testModels[e][ee]._id
      }
      if (testModelRelationships[modelName]) {
        testModelRelationships[modelName].forEach(function(a, b, c) {
          var model = testModels[e][ee];
          var relationship = a;
          var url = '/' + inflection.pluralize(relationship.model.toLowerCase()) + '/';

          if (relationship.type === 'hasMany') {
            //modelInfo.model[relationship.through] = [testModels[relationship.model][0]._id];
            it('It should verify ' + modelName + ' with Id ' + testModels[e][ee]._id +
              'has  ' + relationship.model + ' with Id ' + testModels[relationship.model][0]._id +
              ' via hasMany through ' + relationship.relationMember,
              function(done) {
                url += testModels[relationship.model][ii]._id;

                request(app)
                  .get(url)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {

                    if (res.body[relationship.relationMember]._id.toString() !== model._id.toString()) {
                      throw new Error('FAILED ' + modelName + ' with Id ' + testModels[e][ee]._id +
                        'has  ' + relationship.model + ' with Id ' + testModels[relationship.model][0]._id +
                        ' via hasMany through ' + relationship.relationMember)
                    }
                  })
                  .expect(200, done);

              });


          } else if (relationship.type === 'hasAndBelongsToMany') {
            //modelInfo.model[relationship.through] = [testModels[relationship.model][1]._id];
            it('It should verify ' + modelName + 'with Id ' + testModels[e][ee]._id +
              ' belongs to  ' + relationship.model + ' with Id ' + testModels[relationship.model][1]._id +
              ' via hasAndBelongsToMany through ' + relationship.relationMember,
              function(done) {
                url += testModels[relationship.model][ii]._id;
                request(app)
                  .get(url)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {

                    if (res.body[relationship.relationMember][0]._id.toString() !== model._id.toString()) {
                      throw new Error('FAILED ' + modelName + 'with Id ' + testModels[e][ee]._id +
                        ' belongs to  ' + relationship.model + ' with Id ' + testModels[relationship.model][1]._id +
                        ' via hasAndBelongsToMany through ' + relationship.relationMember)
                    }
                  })
                  .expect(200, done);

              });

          } else if (relationship.type === 'belongsTo') {
            var index = testModels[relationship.model].length - 1;
            //modelInfo.model[relationship.through] = testModels[relationship.model][index]._id;
            it('It should verify ' + modelName + 'with Id ' + testModels[e][ee]._id +
              'belongs to  ' + relationship.model + ' with Id ' + testModels[relationship.model][index]._id +
              ' through ' + relationship.relationMember,
              function(done) {
                url += testModels[relationship.model][ii]._id;
                request(app)
                  .get(url)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {
                    if (res.body[relationship.relationMember][0]._id.toString() !== model._id.toString()) {
                      new Error('FAILED ' + modelName + 'with Id ' + testModels[e][ee]._id +
                        'belongs to  ' + relationship.model + ' with Id ' + testModels[relationship.model][index]._id +
                        ' through ' + relationship.relationMember);
                    }
                  })
                  .expect(200, done);

              });

          }
        });
      }

    });
  });
});



describe('Get list of models', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    it('Should return list of  ' + e, function(done) {

      var modelInfo = {
        name: e,
        url: "/" + inflection.pluralize(e.toLowerCase())
      }
      request(app)
        .get(modelInfo.url)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

});




describe('DELETE  model by ID  set child model member to null', function() {
  var deleteOnDelete = {};
  var removeOnDelete = {};
  var match = 0;
  //Get Remove on Delete

  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      if (match) {
        return;
      }
      var modelName = e;

      if (testModelRelationships[modelName]) {
        testModelRelationships[modelName].forEach(function(a, b, c) {

          var relationship = a;
          var model = testModels[e][ee];
          var relatedModel = testModels[relationship.model][ii];
          if (!relationship.onDelete) {
            //removeonDelete

            deleteUrl = "/" + inflection.pluralize(modelName.toLowerCase()) + '/' + testModels[e][ee]._id;
            checkUrl = "/" + inflection.pluralize(relationship.model.toLowerCase()) +
              '/' + testModels[relationship.model][ii]._id;
            it('Should delete ' + modelName + ' with ID ' + model._id,
              function(done) {
                request(app)
                  .delete(deleteUrl)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200, done);
              });

            it('Should have also deleted ' + relationship.model + ' with ID ' + relatedModel._id,
              function(done) {
                request(app)
                  .get(checkUrl)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {
                    var relationMemberValue = res.body[relationship.relationMember];
                    if (relationMemberValue && relationMemberValue.constructor &&
                      relationMemberValue.constructor == Array) {
                      if (res.body[relationship.relationMember].length) {
                        throw new Error('On Delete did not set ' + relationship.relationMember +
                          ' ' + relationship.model +
                          ' to null  ');
                      }

                    } else {
                      if (res.body[relationship.relationMember]) {
                        throw new Error('On Delete did not set ' + relationship.relationMember +
                          ' ' + relationship.model +
                          ' to null  ');
                      }

                    }

                  })
                  .expect(200, done);
              });

            match = 1;
          }
        });
      }
    });
  });
});






describe('DELETE  model by ID  onDelete remove child', function() {
  var deleteOnDelete = {};
  var removeOnDelete = {};
  var match = 0;
  //Get Remove on Delete

  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      if (match) {
        return;
      }
      var modelName = e;

      if (testModelRelationships[modelName]) {
        testModelRelationships[modelName].forEach(function(a, b, c) {

          var relationship = a;
          var model = testModels[e][ee];
          var relatedModel = testModels[relationship.model][ii];
          if (relationship.onDelete) {
            //removeonDelete

            deleteUrl = "/" + inflection.pluralize(modelName.toLowerCase()) + '/' + testModels[e][ee]._id;
            checkUrl = "/" + inflection.pluralize(relationship.model.toLowerCase()) +
              '/' + testModels[relationship.model][ii]._id;
            it('Should delete ' + modelName + ' with ID ' + model._id,
              function(done) {
                request(app)
                  .delete(deleteUrl)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200, done);
              });

            it('Should have also deleted ' + relationship.model + ' with ID ' + relatedModel._id,
              function(done) {
                request(app)
                  .get(checkUrl)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {
                    if (!_.isEmpty(res.body)) {
                      throw new Error('On Delete did not remove ' + relationship.model +
                        ' with ID ' + relatedModel._id);
                    }
                  })
                  .expect(200, done);
              });

            match = 1;
          }
        });
      }
    });
  });
});
