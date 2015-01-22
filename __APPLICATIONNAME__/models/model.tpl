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


__SCHEMANAME__.statics.updateRelationsPreDelete = function(id,  callBack){
  myModel.findById(id, function(err, oldObj){
    if (err) return callBack(err);

    _RELATIONSHIPS.forEach( function(e, i, array ) {
      var relation = _RELATIONSHIPS[i];
      var through  = relation.through;
      var model = mongoose.model(relation.model);

      var relationMember = relation.relationMember;
      if ( relation.onDelete   ) {
        //remove relationships
        myModel.deleteRelation(oldObj, relation, function(err){
          if (err) return callBack(err);
        });
      }else {
        //remove relationship
        myModel.removeRelationship(oldObj, relation, function(err){
          if (err) return callBack(err);
        });
      }
    });
    return callBack(null, {});
  });

}

__SCHEMANAME__.statics.updateRelationsPreUpdate = function(obj,  callBack){

  /*
   * Find previous object prior to saving new object
   */
  myModel.findById(obj._id, function(err, oldObj){
    if (err) return callBack(err);

    _RELATIONSHIPS.forEach( function(e, i, array ) {
      var relation = _RELATIONSHIPS[i];
      var through  = relation.through;
      var model = mongoose.model(relation.model);

      var relationMember = relation.relationMember;
      /*
       * Check if member is an array if so it is a hasMany or hasAndBelongsToMany relationship
       */

      if ( obj && obj[through] && obj[through].constructor && obj[through].constructor === Array) {

        /*
         * Check if there are entries in the saved object that do not exist in the new
         */

        if  ( _.difference(oldObj[through], obj[through]).length){

          //remove relationships
          myModel.removeRelationship(oldObj, relation, function(err, newObj){
            if (err) return callBack(err);
          });
        }

      }else {
      /*
       * Belongs to member
       */
        if ( obj && obj[through] != oldObj[through]  ) {

          //remove relationship
          myModel.removeRelationship(oldObj, relation, function(err){

            if (err) {
              return callBack(err);
            }

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
  if (! obj) return callBack(null, obj);

  if ( obj[through] && obj[through].constructor && obj[through].constructor === Array) {
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){

      var id =  e;
      model.findByIdAndRemove(id, function(err, instance){
        if (err) return callBack(err);


      });
    });

  }else {
    //belongsTo
    model.findByIdAndRemove(obj[through], function(err, instance){
      if (err) return callBack(err);
    });
  }
  return callBack(null, {});
}


__SCHEMANAME__.statics.removeRelationship = function( obj, relation, callBack) {
  var model = mongoose.model(relation.model);
  var through  = relation.through;
  var relationMember = relation.relationMember;
  if (! obj) return callBack(null, {});

  if ( obj[through] && obj[through].constructor && obj[through].constructor === Array) {
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){
      var id =  e;
      model.findById(id, function(err, instance){
        if (err) return callBack(err);
        if (! instance) return callBack(null, obj);

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
        if (! instance._id || ! model ) {return callBack(null, obj);}
        instance.save(instance, function(err, updated ){
          if (err)  {
            return callBack(err, obj);
          }

          return callBack(null, obj);
        });
      });
    });

    return callBack(null, obj);
  }else {
    //belongsTo
    model.findById(obj[through], function(err, instance){
      if (err) return callBack(err);

      //value set to null, or not populated
      if (! instance ) return callBack(null, obj);


      instance[relationMember] = _.without(instance[relationMember], obj._id);
      var list = instance[relationMember];
      var newList =[];
      list.forEach(function(e, i, a){
        if (e.toString() !== obj._id.toString()) {
          newList.push(e);
        }
      });

      instance[relationMember] = newList;

      instance.save(function(err, updated){
        if (err) return callBack(err);
        return callBack(err);
      });
    });
    return callBack(null, obj);
  }

}


__SCHEMANAME__.statics.setRelationship = function( obj, relation, callBack) {
  var model = mongoose.model(relation.model);
  var through  = relation.through;
  var relationMember = relation.relationMember;

  if (! obj || !obj._id) return callBack(null, obj);

  if ( obj[through] && obj[through].constructor && obj[through].constructor === Array) {
    //hasMany or hasAndBelongsToMany
    var relIds = obj[through];
    relIds.forEach(function(e, i, a){
      var id =  e;
      model.findById(id, function(err, instance){
        if (err) return callBack(err);
        if (! instance ) {
          return callBack(null, obj);
        }

        if ( instance[relationMember] && instance[relationMember].constructor === Array){
          //hasAndBelongstoMany
          instance[relationMember].push(obj._id);
        } else {
        //hasMany
          instance[relationMember] = obj._id
        }
        instance.save(function(err, updated){
          if (err) return callBack(err);

          return callBack(err);
        });
      })
    });

  }else {
    //belongsTo

    model.findById(obj[through], function(err, instance){
      if (err) return callBack(err);
      if (! instance ) return(null, obj);
      instance[relationMember].push(obj._id);
      instance.save(function(err, updated){
        if (err) return callBack(err);
        return callBack(err);

      });
    });
  }

}

__SCHEMANAME__.statics.updateRelationsOnCreate = function( obj, callBack){

  _RELATIONSHIPS.forEach( function(e, i, array ) {
    var relation = _RELATIONSHIPS[i];

    myModel.setRelationship(obj, relation, function(err){
      if (err) return callBack(err);
    });

  });
  return callBack(null, obj);
}
module.exports = mongoose.model('__MODELNAME__', __SCHEMANAME__);

var myModel =  mongoose.model('__MODELNAME__');
