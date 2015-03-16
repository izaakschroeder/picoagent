
var _ = require('lodash'),
	methods = require('methods'),
	url = require('url'),
	bl = require('bl'),
	http = require('http'),
	https = require('https');

var Promise = require('bluebird');

var _ = require('lodash'),
	methods = require('methods'),
	url = require('url');

var typeis = require('type-is');



var qs = require('qs');

var types = {
	'application/x-www-form-urlencoded': qs,
	'multipart/form-data': '',
	'application/json': JSON,
	'+json': JSON,
	'text/html': '',
	'text/xml': '',
	'+xml': ''
};

function getType(type) {
	if (!type) {
		return null;
	}
	return _.find(types, function(entry, pattern) {
		return typeis.is(type, pattern);
	});
}

function normalizeHeaders(headers) {
	return _.chain(headers || { })
		.map(function(value, name) {
			return [ name.toLowerCase(), value ];
		})
		.object()
		.value();
}

function isStream(obj) {
	return _.has(obj, 'pipe') && _.isFunction(obj.pipe);
}

function normalizeOptions(options) {
	// If url is a string then parse it
	if (_.isString(options)) {
		return _.pick(url.parse(options), _.identity);
	} else if (_.isFunction(options)) {
		return {
			protocol: 'http:',
			port: 0,
			hostname: 'localhost',
			server: options
		};
	} else {
		return options;
	}
}

function request(options) {

	options = _.chain(arguments)
		.map(normalizeOptions)
		.transform(_.assign, { })
		.value();

	var backend = options.protocol === 'https:' ? https : http;

	var headers = normalizeHeaders(options.headers)

	return Promise.resolve().then(function() {
		// If we need to create a server for this URL then handle it.
		if (options.server) {
			return new Promise(function(resolve) {
				options.server = backend.createServer(options.server)
					.listen(options.port, options.hostname, function() {
						options.port = this.address().port;
						resolve();
					});
			});
		}
	}).then(function() {
		// If we need to send data up to the server then handle it.
		var type = getType(headers['content-type']);
		if (type && _.has(type, 'stringify')) {
			options.body = type.stringify(options.body);
		}
	}).then(function() {

		return new Promise(function(resolve, reject) {
			var request = backend.request(options, function(response) {
				if (options.parse === 'stream') {
					_.assign(response, {
						body: response
					});
					resolve(response);
				} else {
					response.pipe(bl(function(err, data) {
						if (err) {
							reject(err);
						} else {
							_.assign(response, {
								body: data
							});
							resolve(response);
						}
					}))
				}

			});

			request.once('error', reject);

			if (isStream(options.body)) {
				options.body.pipe(request);
			} else {
				request.end(options.body);
			}


		});
	}).then(function(response) {
		if (false && _.isFunction(options.parse)) {
			response.body = options.parse(response.body);
		} else {
			var type = getType(_.isString(options.parse) ?
				options.parse : response.headers['content-type']
			);
			if (type && _.has(type, 'parse')) {
				response.body = type.parse(response.body);
			}
		}
		return response;
	}).finally(function() {
		if (options.server) {
			options.server.close();
		}
	});
}

module.exports = {
	request: request
};
