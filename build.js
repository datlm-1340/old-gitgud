const mkdirp = require('mkdirp');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');
const uglify = require('uglify-js');
const fs = require('fs');
const zipFolder = require('zip-folder');
const async = require('async');

async.series([
	function (callback) {
		rimraf('build', [], callback);
	},
	function (callback) {
		rimraf('build.zip', [], callback);
	},
	function (callback) {
		mkdirp('build/static/js', callback);
	},
	function (callback) {
		mkdirp('build/static/css', callback);
	},
	function (callback) {
		var result = uglify.minify(["lib/*"]);
		fs.writeFile("build/static/js/vendor.min.js", result.code, callback);
	},
	function (callback) {
		var result = uglify.minify(["src/main.js", "src/main/*", "src/init.js"]);
		fs.writeFile("build/static/js/main.min.js", result.code, callback);
	},
	function (callback) {
		var result = uglify.minify(["src/popup/index.js"]);
		fs.writeFile("build/static/js/index.min.js", result.code, callback);
	},
	function (callback) {
		ncp('src/main.css', 'build/static/css/main.css', callback);
	},
	function (callback) {
		ncp('src/popup/style.css', 'build/static/css/style.css', callback);
	},
	function (callback) {
		ncp('src/popup/index.html', 'build/index.html', callback);
	},
	function (callback) {
		ncp('src/popup/options.html', 'build/options.html', callback);
	},
	function (callback) {
		ncp('manifest.json', 'build/manifest.json', callback);
	},
	function (callback) {
		ncp('images', 'build/images', callback);
	},
	function (callback) {
		zipFolder('build', 'build.zip', callback);
	},
]);
