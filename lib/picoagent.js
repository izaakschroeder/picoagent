
'use strict';


var _ = require('lodash');
var methods = require('methods');
var agent = require('./transport/http');


_.assign(agent, _.chain(methods)
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
	.value()
);

module.exports = agent;
