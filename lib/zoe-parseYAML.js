#! /usr/bin/env node
var yaml = require('js-yaml')
var fs = require('fs');

module.exports = function(yamlFile) {
	try {
		var doc = yaml.safeLoad(fs.readFileSync(yamlFile));
		return doc;
	} catch(e){
		console.log(e), process.exit(1);
	}
}
