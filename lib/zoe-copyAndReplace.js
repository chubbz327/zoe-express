#! /usr/bin/env node
var fs = require('fs-extra')
var exec = require( 'child_process' ).exec;

module.exports = function(appName, callBack) {

	exec( 'rm -r ./' + appName, function ( err, stdout, stderr ){
		fs.copy(__dirname + '/../__APPLICATIONNAME__', appName, function (err) {
			if (err) {
				return console.error(err);
			}

		var replace = require("replace");

		replace({
			regex: "__APPLICATIONNAME__",
			replacement: appName,
			paths: ['./' + appName],
			recursive: true,
			silent: true,
		});
		callBack(null );
	});
});

}
