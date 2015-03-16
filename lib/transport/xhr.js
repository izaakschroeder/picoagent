
'use strict';

var _ = require('lodash'),
	Promise = require('bluebird');

function request(options) {
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();

		req.open(options.method, options.url, true);
		req.timeout = options.timeout;
		req.responseType = options.responseType;

		_.forEach(options.headers, function(value, name) {
			req.setRequestHeader(name, value);
		});

		if (_.isString(options.parse)) {
			req.overrideMimeType(options.parse);
		}

		req.onreadystatechange = function() {
			if (this.readyState === xhr.DONE) {
				resolve({
					statusCode: this.status,
					headers: this.getAllResponseHeaders(),
					body: this.response
				});
			}
		};
		req.onerror = function() {
			reject();
		};
		req.onload = function() {

		};
		req.send(options.data);
	});
}

module.exports = {
	request: request
};
