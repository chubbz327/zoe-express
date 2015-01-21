var fs = require('fs-extra');
var inflection = require('inflection');
var replace = require("replace");


module.exports = function(appName, obj, callBack) {
//Setup models
  var setupTestModels = "testModels['" + obj.name +"'] =[];\n";


//Set member descriptions for autofixture factory
  var memberDescription = "factory.define('";
  memberDescription += obj.name + "',[";

  Object.keys(obj.members).forEach(function(e, i, a) {

    var memberName = e;
    var memberType = obj.members[e];
    var match = 0;


    if (memberType === 'String') {
      memberDescription += "'" + memberName + "',";;
    }


    if (memberType === 'Number') {
      memberDescription += "'" + memberName + "'.asNumber(),";

    }

    if (memberType === 'Date') {
      memberDescription += "'" + memberName + "'.asDate(),";

    }

    if (match) {
      return; //continue
    }

    //check if belongsTo
    if (memberType.type && memberType.type.match(/ObjectId/)) {
      memberDescription += "'" + memberName + "'.as(getNull),";
    }

    //hasMany or hasAndBelongsToMany
    if (memberType[0] && memberType[0].type &&
      memberType[0].type.match(/ObjectId/)) {
      memberDescription += "'" + memberName + "'.as(getEmpty),";
    }

    //console.log(memberName, memberType, member );
    console.log(memberType);
    if (i == (Object.keys(obj.members).length - 1)) {
    //  memberDescription = memberDescription.substring(0,
      //  memberDescription.length - 1);
      memberDescription += "'_id'.as(getObjectId),";

    }

  });
  //remove extra ','
  memberDescription += "]);\n";
  replace({
    regex: "__FACTORYDEFINE__",
    replacement: "__FACTORYDEFINE__\n" + memberDescription,
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });



  replace({
    regex: "__SETUPTESTMODELS__",
    replacement: "__SETUPTESTMODELS__\n" + setupTestModels,
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });


  //setup Relationships for tests
  var testModelRelationships = "testModelRelationships['" + obj.name + "'] =" +JSON.stringify(obj.relationships);

  replace({
    regex: "__TESTMODELRELATIONSHIPS__",
    replacement: "__TESTMODELRELATIONSHIPS__\n" + testModelRelationships,
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });

}
