var fs = require('fs-extra');
var inflection = require( 'inflection' );
var replace = require("replace");

var appJSEntries = '';
module.exports = function(yaml,appName,  callBack) {
  var routeTemplate ='./' + appName +'/routes/route.tpl';
  for (var i in yaml.models) {
    var obj = yaml.models[i];
    var schemaName = obj.name +'Schema';

/*
  Create the Model code
*/
    var modelCode = "\nvar mongoose = require('mongoose');\n";

    modelCode += "var " + schemaName + " =  new mongoose.Schema(\n";

modelCode += JSON.stringify(obj.member).replace(/"/g, ' ');
modelCode += ");\n" +

"module.exports = mongoose.model('"+ obj.name + "', "+ schemaName+ ");\n";
  var modelFile =  './' + appName + '/models/' + obj.name + '.js';
  fs.writeFile (modelFile, modelCode, function(err){
    if (err) return callBack(err);
    callBack(null );
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

}
