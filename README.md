# picoagent

A leaner [superagent] with Promises and streams2+.

![build status](http://img.shields.io/travis/izaakschroeder/picoagent/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/izaakschroeder/picoagent/master.svg?style=flat)
![license](http://img.shields.io/npm/l/picoagent?style=flat)
![version](http://img.shields.io/npm/v/picoagent.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/picoagent.svg?style=flat)

More details coming soon™.

```javascript
var request = require('picoagent');

// Create request from URL
request('http://www.google.ca')

// Use HTTP .VERB syntax
request.post('http://www.google.ca');

// Specify any number of the usual options to http[s].request and some other
// convience properties.
request('http://www.google.ca' {
	headers: {
		'Accept': '*',
		'Content-Type': 'application/json'
	},
	body: {
		foo: 'bar'
	}
});

// Use http server middleware
var server = function(request, response) {
	response.writeHead(200, { });
	response.end('Hello world.');
}
request.get(server, '/foo');
```

```javascript
var Agent = require('picoagent');

// Create custom instance
var agent = new Agent();

// Call.
agent.request(...);
```
