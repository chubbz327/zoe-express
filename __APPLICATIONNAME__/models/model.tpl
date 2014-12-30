var _HASMANY = __HASMANY__;
var _BELONGSTO = __BELONGSTO__;

populate_members = '__POPULATEMEMBERS__';

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


module.exports = mongoose.model('__MODELNAME__', __SCHEMANAME__);
