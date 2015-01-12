var _ = require("underscore");
var _RELATIONSHIPS = __RELATIONSHIPS__;

var populate_members = '__POPULATEMEMBERS__';

var mongoose = require('mongoose'), Schema = mongoose.Schema;


var  __SCHEMANAME__ =  new mongoose.Schema(
__SCHEMADEF__
);



__SCHEMANAME__.statics.findAndPopulate = function(callBack){

  return this.find().populate(populate_members).exec(callBack);
}

__SCHEMANAME__.statics.findByIdAndPopulate = function(id, callBack){

  return this.findById(id).populate(populate_members).exec(callBack);
}


__SCHEMANAME__.statics.updateRelationsPreDelete = function(obj,  callBack){
  myModel.findById(obj._id, function(err, oldObj){
    if (err) return callBack(err);
    console.log(oldObj + '\n' + obj);
    _RELATIONSHIPS.forEach( function(e, i, array ) {
      var relation = _RELATIONSHIPS[i];
      var through  = relation.through;
      var model = mongoose.model(relation.model);

      var relationMember = relation.relationMember;
      if (( relation.onDelete )&& ( relation.onDelete.match(/delete/i) ) ) {
        //remove relationships
        console.log('Deleting Relation', relation);
        myModel.deleteRelation(oldObj, relation, function(err){
          if (err) callBack(err);
        });
      }else {
        //remove relationship
        myModel.removeRelationship(oldObj, relation, function(err){
          if (err) callBack(err);
        });
      }
    });
    return callBack(null, obj);
  });

}

__SCHEMANAME__.statics.updateRelationsPreUpdate = function(obj,  callBack){
  //console.log(obj);

  //console.log('ID ' + obj._id);
  myModel.findById(obj._id, function(err, oldObj){
    if (err) return callBack(err);
  console.log(oldObj + '\n' + obj);
    _RELATIONSHIPS.forEach( function(e, i, array ) {
      var relation = _RELATIONSHIPS[i];
      var through  = relation.through;
      var model = mongoose.model(relation.model);

      var relationMember = relation.relationMember;
      if ( obj[through].constructor === Array) {
        if  ( _.difference(oldObj[through], obj[through]).length){
          //remove relationships
          myModel.removeRelationship(oldObj, relation, function(err){
            if (err) callBack(err);
          });
        }
        if (  _.difference( obj[through], oldObj[through]).length ){
          //set relationships
          myModel.setRelationship(obj, relation, function(err){
            if (err) callBack(err);
          });
        }

      }else {
        if ( obj[through] !== oldObj[through]  ) {

          //remove relationship
          myModel.removeRelationship(oldObj, relation, function(err){
            if (err) callBack(err);
            myModel.setRelationship(obj, relation, function(err){
              if (err) callBack(err);
            });
          });

        }
      }

    });
    return callBack(null, obj);
  });

}


__SCHEMANAME__.statics.deleteRelation = function( obj, relation, callBack) {
  var model = mongoose.model(relation.model);
  var through  = relation.through;
  var relationMember = relation.relationMember;

  if ( obj[through].constructor === Array){
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){
      var id =  e;
      model.findByIdAndRemove(id, function(err, instance){
        if (err) callBack(err);
      });
    });

  }else {
    //belongsTo
    model.findByIdAndRemove(obj[through], function(err, instance){
      if (err) callBack(err);
      console.log("Removed ", instance);
    });
  }

}


__SCHEMANAME__.statics.removeRelationship = function( obj, relation, callBack) {
  var model = mongoose.model(relation.model);
  var through  = relation.through;
  var relationMember = relation.relationMember;

  if ( obj[through].constructor === Array){
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){
      var id =  e;
      model.findById(id, function(err, instance){
        if (err) callBack(err);

        if (instance[relationMember].constructor === Array ){

          var myNewList = [];
          for (var i =0; i < instance[relationMember].length; i++ ){
            var childObj = instance[relationMember][i];
            if (childObj.toString() !== obj._id.toString())
              myNewList.push(obj._id);
          }

          instance[relationMember] = myNewList;

        } else {
          //hasMany
          instance[relationMember] = null;
        }

        instance.save(function(err, updated){
          if (err) callBack(err);

          console.log('updated Model' + relation.model + ' ' +  updated._id);
        });
      })
    });

  }else {
    //belongsTo
    model.findById(obj[through], function(err, instance){
      if (err) callBack(err);


      instance[relationMember] = _.without(instance[relationMember], obj._id);
      instance.save(function(err, updated){
        if (err) callBack(err);
        console.log('updated Model' + relation.model + ' ' +  updated._id);

      });
    });
  }

}


__SCHEMANAME__.statics.setRelationship = function( obj, relation, callBack) {
  var model = mongoose.model(relation.model);
  var through  = relation.through;
  var relationMember = relation.relationMember;

  if ( obj[through].constructor === Array){
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){
      var id =  e;
      model.findById(id, function(err, instance){
        if (err) callBack(err);
        instance[relationMember].push(obj._id);
        instance.save(function(err, updated){
          if (err) callBack(err);

          console.log('updated Model' + relation.model + ' ' +  updated._id);
        });
      })
    });

  }else {
    //belongsTo
    model.findById(obj[through], function(err, instance){
      if (err) callBack(err);
      instance[relationMember].push(obj._id);
      instance.save(function(err, updated){
        if (err) callBack(err);
        console.log('updated Model' + relation.model + ' ' +  updated._id);

      });
    });
  }

}

__SCHEMANAME__.statics.updateRelationsOnCreate = function( obj, callBack){

  _RELATIONSHIPS.forEach( function(e, i, array ) {
    var relation = _RELATIONSHIPS[i];

    myModel.setRelationship(obj, relation, function(err){
      if (err) callBack(err);
    });

    //console.log('returning')

  });
  return callBack(null, obj);
}
module.exports = mongoose.model('__MODELNAME__', __SCHEMANAME__);

var myModel =  mongoose.model('__MODELNAME__');
