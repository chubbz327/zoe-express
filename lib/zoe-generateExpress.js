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
  var has_many = false;
  var belongs_to = false;
  var populate_members = '';
  var members = [];

  if (obj.has_many_members){
    has_many = JSON.stringify(obj.has_many_members).replace(/"/g, ' ');
    for (var i in obj.has_many_members ){
      members.push(Object.keys(obj.has_many_members[i])[0]);
    }

  }

  if (obj.belongs_to_members) {
    belongs_to = JSON.stringify(obj.belongs_to_members).replace(/"/g, ' ');
    for (var i in obj.belongs_to_members ){
      members.push(Object.keys(obj.belongs_to_members[i])[0]);
    }
  }
  populate_members = members.join(" ");
  var modelTemplate = './' + appName +'/models/model.tpl';
  var modelFile =  './' + appName + '/models/' + obj.name + '.js';
  fs.copySync(modelTemplate, modelFile);

//Get fields for populate

  replace({
    regex: "__POPULATEMEMBERS__",
    replacement: populate_members,
    paths: [modelFile],
    recursive: true,
    silent: true,
  });
  replace({
    regex: "__HASMANY__",
    replacement: has_many,
    paths: [modelFile],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__BELONGSTO__",
    replacement: belongs_to,
    paths: [modelFile],
    recursive: true,
    silent: true,
  });

  replace({
    regex: "__SCHEMADEF__",
    replacement: JSON.stringify(obj.member).replace(/"/g, ' '),
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
