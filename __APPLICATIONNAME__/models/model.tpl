var mongoose = require('mongoose'), Schema = mongoose.Schema;

var  __SCHEMANAME__ =  new mongoose.Schema(
__SCHEMADEF__
);

module.exports = mongoose.model('__MODELNAME__', __SCHEMANAME__);
var _HASMANY = __HASMANY__;
var _BELONGSTO = __BELONGSTO__;

populate_members = '__POPULATEMEMBERS__';
