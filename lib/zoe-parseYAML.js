#! /usr/bin/env node
var yaml = require('js-yaml')
var fs = require('fs');

module.exports = function(yamlFile) {
	try {
		var doc = yaml.safeLoad(fs.readFileSync(yamlFile));
		//console.log(yaml.dump(doc));
		return doc;
	} catch(e){
		console.error(e), process.exit(1);
	}
}
