#! /usr/bin/env node
var fs = require('fs-extra')
var exec = require( 'child_process' ).exec;

module.exports = function(appName, callBack) {

	exec( 'rm -r ./' + appName, function ( err, stdout, stderr ){
		console.log('Removing directory if exits ' + appName);
		fs.copy(__dirname + '/../__APPLICATIONNAME__', appName, function (err) {
			if (err) {
				return console.error(err);
			}
		console.log('Copied ' + appName);

		var replace = require("replace");

		replace({
			regex: "__APPLICATIONNAME__",
			replacement: appName,
			paths: ['./' + appName],
			recursive: true,
			silent: true,
		});
		console.log('Replaced template variable names in ' + appName);
		callBack(null );
	});
});

}
