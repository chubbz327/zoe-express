var mongoose = require('mongoose');

var getObjectId = function (i) {
  return (new mongoose.Types.ObjectId).toString();
}


var getObjectIdArray = function (i) {
  var fieldName = this;

    result = [];
    for (var j = 0; j < 11; j++) {
      result.push(getObjectId(i));
    }
    return result;
}

var getEmptyArray = function (i) {
  var fieldName = this;

  result = [];
  return result;
}


var getEmpty = function (i) {
  return ;
}

var getNull = function (i) {
  return null ;
}

module.exports = function(factory) {
  __FACTORYDEFINE__

}
