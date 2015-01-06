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


__SCHEMANAME__.methods.updateRelationsPreUpdate = function(obj,  callBack){

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
    var myModel =  mongoose.model('__MODELNAME__');
    myModel.setRelationship(obj, relation, function(err){
      if (err) callBack(err);
    });


  return callBack(null, obj);
  });
}
module.exports = mongoose.model('__MODELNAME__', __SCHEMANAME__);
