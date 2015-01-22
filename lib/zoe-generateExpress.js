var fs = require('fs-extra');
var inflection = require( 'inflection' );
var replace = require("replace");
var generateTests = require('./zoe-generateTests');

var appJSEntries = '';
module.exports = function(yaml,appName,  callBack) {
  var routeTemplate ='./' + appName +'/routes/route.tpl';
  for (var i in yaml.models) {
    var obj = yaml.models[i];
    var schemaName = obj.name +'Schema';

/*
  Create the Model code
*/
  var relationships = [];
  var populate_members = '';
  var members = [];

  if ( obj.relationships ){
    for ( var i = 0; i < obj.relationships.length; i++){
      var relation = obj.relationships[i];
      relationships.push(relation);
      members.push(relation['through']);
    }
  }


  populate_members = members.join(" ");
  var modelTemplate = './' + appName +'/models/model.tpl';
  var modelFile =  './' + appName + '/models/' + obj.name + '.js';
  fs.copySync(modelTemplate, modelFile);

//Get fields for populate
  replace({
    regex: "__RELATIONSHIPS__",
    replacement: JSON.stringify(relationships),
    paths: [modelFile],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__POPULATEMEMBERS__",
    replacement: populate_members,
    paths: [modelFile],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__SCHEMADEF__",
    replacement: JSON.stringify(obj.members).replace(/"/g, ' '),
    paths: [modelFile],
    recursive: true,
    silent: true,
  })

  replace({
    regex: "__SCHEMANAME__",
    replacement: schemaName,
    paths: [modelFile],
    recursive: true,
    silent: true,
  })

  replace({
    regex: "__MODELNAME__",
    replacement: obj.name,
    paths: [modelFile],
    recursive: true,
    silent: true,
  });




  var modelNameLower = obj.name.toLowerCase();
  var modelNamePlural = inflection.pluralize(modelNameLower);


/*
  Copy route.tpl to modelNamePlural.js
*/
  var modelRouteFile =  './' + appName +'/routes/' + modelNamePlural +'.js';
  fs.copySync(routeTemplate, modelRouteFile);
    //Replace __MODELNAME__ in route file
  replace({
    regex: "__MODELNAME__",
    replacement: obj.name,
    paths: [modelRouteFile],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__MODELNAMELOWERPLURAL__",
    replacement: modelNamePlural,
    paths: [modelRouteFile],
    recursive: true,
    silent: true,
  });



  /*
  create Tests
  */
  generateTests(appName, obj,
    function(err, memberDescription ){
    if (err){
      callBack(err);
    }

  });





  /*
  Add entries to the app.js file

  var todos = require('./routes/todos');
  app.use('/todos', todos);
  */

    appJSEntries +="var " + modelNamePlural +
      " = require('./routes/" +modelNamePlural +"');\n";
    appJSEntries += "app.use('/" + modelNamePlural + "', " + modelNamePlural +");\n";

  }
  //Replace the APPJSENTRIES variable in app.js
  replace({
    regex: "__APPJSENTRIES__",
    replacement: appJSEntries,
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });



//Remove place holders

  replace({
    regex: "__FACTORYDEFINE__",
    replacement: "",
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__SETUPTESTMODELS__",
    replacement: "",
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__TESTMODELRELATIONSHIPS__",
    replacement: "",
    paths: ['./' + appName],
    recursive: true,
    silent: true,
  });

}
