#! /usr/bin/env node

/**
 * New node file
 */


var fs = require('fs');

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
//getOpt.showHelp();

var zoeCopyAndReplace = require('./lib/zoe-copyAndReplace');
var appName = getOpt.parsedOption.argv[0];
zoeCopyAndReplace(appName, function (err){
  if (err) console.log(err), process.exit(1);

  var zoeGenerateModels = require('./lib/zoe-generateExpress');
  zoeGenerateModels(yaml,appName, function(err){
    console.error(err);
  });
});


//console.info(yaml);

//console.log(getOpt);
