
'use strict';

var _ = require('lodash'),
	methods = require('methods'),
	url = require('url'),
	bl = require('bl'),
	http = require('http'),
	https = require('https');


var readers = {
	'application/json': function(response) {
		return new Promise(function(resolve, reject) {
			stream.pipe(bl(function(err, result) {
				if (err) {
					reject(err);
				} else {
					resolve(JSON.parse(result));
				}
			}));
		});
	}
};

var writers = {
	'application/json': function(data) {
		return new Promise(function(resolve) {
			resolve(JSON.stringify(data));
		});
	}
};


function normalizeHeaders(headers) {
	return _.chain(headers || { })
		.map(function(value, name) {
			return [ name.toLowerCase(), value ];
		})
		.object()
		.value();
}

function httpHandler(options) {
	var backend = options.protocol === 'https:' ? https : http;

	var headers = normalizeHeaders(options.headers)

	return Promise.resolve().then(function() {
		// If we need to create a server for this URL then handle it.
		if (options.server) {
			return new Promise(function(resolve) {
				backend.createServer(options.server)
					.listen(options.port, options.hostname, function() {
						options.port = this.address().port;
						resolve();
					});
			});
		}
	}).then(function() {
		// If we need to send data up to the server then handle it.
		if (options.data) {
			var type = headers['content-type'];

		}
	}).then(function() {
		return new Promise(function(resolve, reject) {
			var request = backend.request(options, function(response) {
				response.pipe(bl(function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(_.assign(response, {
							body: data
						}));
					}
				}))
			});

			request.once('error', reject);
			request.end();

		});
	});
}


function Agent(options) {
	_.assign(this, {
		handlers: {
			'http:': httpHandler,
			'https:': httpHandler
		}
	}, options)
}

Agent.normalizeOptions = function(options) {
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

Agent.prototype.request = function(options) {

	// Build options from all arguments
	options = _.chain(arguments)
		.map(Agent.normalizeOptions)
		.transform(_.assign, { })
		.value();

	// Can we handle the protocol?
	if (!_.has(this.handlers, options.protocol)) {
		return Promise.reject(
			new Error('Cannot handle protocol: ' + options.protocol)
		);
	}

	// Dispatch
	return this.handlers[options.protocol](options);
}


var verbs = _.chain(methods)
	.map(function(method) {
		return [
			method,
			function() {
				var args = _.toArray(arguments);
				args.push({
					method: method.toUpperCase()
				});
				return this.request.apply(this, args);
			}
		];
	})
	.object()
	.value();

var agent = new Agent();
_.assign(agent, verbs);

_.assign(Agent, _.bindAll(agent));

module.exports = Agent;
