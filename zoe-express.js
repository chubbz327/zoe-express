#! /usr/bin/env node

/**
 * New node file
 */


var fs = require('fs');

// Parse command line flags/options

var GetOpt = require('node-getOpt');
var getOpt  = new GetOpt(
  [
    ['', 'yaml=ARG', 'yaml files from which to read models'],
    ['h', 'help', 'show help message'],
  ]);

  getOpt.setHelp(
    'Usage: node zoe-express.js [OPTIONS] \n' +
    '\t --yaml <yaml file to parse> \n' +
    '\t -h --help '

  )
  .bindHelp()
  .parseSystem();

var yamlFile = getOpt.parsedOption.options.yaml
if (! yamlFile) getOpt.showHelp(), process.exit(1);


/*
 * Read in YAML description file
 */

var zoeParseYAML = require('./lib/zoe-parseYAML');
var yaml = zoeParseYAML(yamlFile);

/*
 * Replace file names in template directory
 */

var zoeCopyAndReplace = require('./lib/zoe-copyAndReplace');
var appName = getOpt.parsedOption.argv[0];
zoeCopyAndReplace(appName, function (err){
  if (err) console.log(err), process.exit(1);

  /*
   * Generate routes and models
   *
   */

  var zoeGenerateModels = require('./lib/zoe-generateExpress');
  zoeGenerateModels(yaml,appName, function(err){
    console.error(err);

    /*
    * Generate tests data
    */


  });


});



