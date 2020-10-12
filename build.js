var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var rimraf = require('rimraf');
var zipFolder = require('zip-folder');
var UglifyJS = require('uglify-js');
var fs = require('fs');
var async = require('async');

async.series([
	function (callback) {
		rimraf('build', [], callback);
	},
	function (callback) {
		mkdirp('build/static/js', callback);
	},
	function (callback) {
		mkdirp('build/static/css', callback);
	},
	function (callback) {
		var result = UglifyJS.minify(["lib/*"]);
		fs.writeFile("build/static/js/vendor.min.js", result.code, callback);
	},
	function (callback) {
		var result = UglifyJS.minify(["src/main.js", "src/main/*", "src/init.js"]);
		fs.writeFile("build/static/js/main.min.js", result.code, callback);
	},
	function (callback) {
		var result = UglifyJS.minify(["src/popup/index.js"]);
		fs.writeFile("build/static/js/index.min.js", result.code, callback);
	},
	function (callback) {
		ncp('src/main.css', 'build/static/css/main.css', callback);
	},
	function (callback) {
		ncp('src/popup/index.html', 'build/index.html', callback);
	},
	function (callback) {
		ncp('manifest.json', 'build/manifest.json', callback);
	},
	function (callback) {
		ncp('images', 'build/images', callback);
	}
]);
