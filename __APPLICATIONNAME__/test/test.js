var _ = require("underscore");
var util = require('util');

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

var alreadyDeleted = [];

/*
 * Generate test data; create three instances of each model
 */
Object.keys(testModels).forEach(function(e, i, a) {
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

/*
 * Save modelinstances via post
 */
describe('POST create models', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {

      var modelName = e;
      var model = testModels[e][ee];
      var url = "/" + inflection.pluralize(e.toLowerCase());

      it(util.format("It should create Model %s " +
        " with Id %s", modelName, model._id), function(done) {
        request(app)
          .post(url)
          .send(model)
          .expect(200, done);
      });
    });

  });

});


describe('Get model by ID', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      var modelName = e;
      var model = testModels[e][ee];
      var url = "/" + inflection.pluralize(e.toLowerCase()) + '/' + model._id;
      it(util.format('It should get model using %s using Id %s', e, model._id), function(done) {
        request(app)
          .get(url)
          .expect(function(res) {
            if (res.body._id !== model._id.toString()) {
              throw new Error(util.format("Could not retrieve model %s with Id %s ", modelName, model._id));
            }
          })
          .expect(200, done);
      });
    });

  });

});

/*
 * Update each model; if relationships exist; populate the members
 */

describe('PUT update models', function() {
  Object.keys(testModels).forEach(function(e, i, a) {
    Object.keys(testModels[e]).forEach(function(ee, ii, aa) {
      var modelName = e;
      var model =  testModels[e][ee];
      var url = "/" + inflection.pluralize(e.toLowerCase()) + '/' + model._id

      it(util.format('It should update model %s with Id %s', modelName, model._id), function(done) {

        if (testModelRelationships[modelName]) {
          testModelRelationships[modelName].forEach(function(a, b, c) {
            var relationship = a;
            var relatedModel = testModels[relationship.model][ii];

            if (relationship.type === 'hasMany') {
              model[relationship.through] = [relatedModel._id];
            } else if (relationship.type === 'hasAndBelongsToMany') {
              model[relationship.through] = [relatedModel._id];
            } else if (relationship.type === 'belongsTo') {
              model[relationship.through] = relatedModel._id;
            }
          });
        }

        request(app)
          .put(url)
          .send(model)
          .expect(function(res) {
            //Check relationships Persisted
            if (testModelRelationships[modelName]) {
              testModelRelationships[modelName].forEach(function(a, b, c) {
                var relationship = a;
                if (relationship.type === 'hasMany' || relationship.type === 'hasAndBelongsToMany') {
                  if (model[relationship.through][0].toString() != res.body[relationship.through]) {
                    throw new Error("Relationship update failed for %s %s ",
                      modelName, model[relationship.through]);
                  }
                } else if (relationship.type === 'belongsTo') {
                  var index = testModels[relationship.model].length - 1;
                  if (model[relationship.through].toString() != res.body[relationship.through].toString()) {
                    throw new Error("Relationship update failed for %s %s ",
                      modelName, model[relationship.through]);
                  }
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
      var model = testModels[e][ee];


      if (testModelRelationships[modelName]) {
        testModelRelationships[modelName].forEach(function(a, b, c) {
          var relationship = a;
          var relatedModel = testModels[relationship.model][ii];
          var url = '/' + inflection.pluralize(relationship.model.toLowerCase()) + '/';

          if (relationship.type === 'hasMany') {
             it(util.format("It should verify %s with Id %s has %s with Id %s via hasMany through %s",
                modelName, model._id, relationship.model, testModels[relationship.model][ii]._id,
                relationship.relationMember),
              function(done) {
                url += testModels[relationship.model][ii]._id;

                request(app)
                  .get(url)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(function(res) {

                    if (res.body[relationship.relationMember]._id.toString() !== model._id.toString()) {
                      throw new Error( util.format( "Model %s with Id %s does not have "+
                                      "hasMany relationship with %s through %s ",
                                      modelName, model._id, relation.model,
                                      relatedModel._id, relationship.relationMember)
                                    );
                    }
                  })
                  .expect(200, done);

              });


          } else if (relationship.type === 'hasAndBelongsToMany') {
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
                      throw new Error( util.format( "Model %s with Id %s does not have "+
                      "hasAndBelongsToMany relationship with %s through %s",
                      modelName, model._id, relation.model, relatedModel._id,
                      relationship.relationMember)
                    );
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
                      throw new Error( util.format( "Model %s with Id %s does not have "+
                      "belongsTo relationship with %s through %s",
                      modelName, model._id, relation.model, relatedModel._id,
                      relationship.relationMember)
                    );
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

            deleteUrl = "/" + inflection.pluralize(modelName.toLowerCase()) + '/' + model._id;

            checkUrl = "/" + inflection.pluralize(relationship.model.toLowerCase()) +
              '/' + testModels[relationship.model][ii]._id;

            alreadyDeleted.push(model._id);
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


/*
 * Remove test data
 */
// 
// describe('Delete model by ID', function() {
//   Object.keys(testModels).forEach(function(e, i, a) {
//     var removeIds = [];
//     var modelInfo = {
//       name: e,
//       url: "/" + inflection.pluralize(e.toLowerCase())
//     }
//     it('Should get a list of   ' + e + ' Ids', function(done) {
//
//       request(app)
//       .get(modelInfo.url)
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(function(res){
//         res.body.forEach(function(e, i, a){
//           removeIds.push(e._id);
//         });
//       })
//       .expect(200, done);
//
//     });
//
//     it('Should delete ' + e + ' by ID', function (done){
//       removeIds.forEach(function(e, i, a){
//         var url = modelInfo.url + '/' +e;
//         request(app)
//         .delete(url)
//         .expect(200, done);
//       });
//     });
//   });
// });
