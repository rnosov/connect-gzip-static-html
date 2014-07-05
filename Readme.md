[![NPM version](https://img.shields.io/npm/v/connect-gzip-static-html.svg)](https://www.npmjs.org/package/connect-gzip-static-html)

# connect-gzip-static-html

This middleware is identical to the connect-gzip-static except for the fact that will also serve .html files without extension. For example, if `/about.html` you can use `/about` to serve it. It will serve gzipped version if `/about.html.gz` is present.

Middleware for [connect][]: serves compressed files if they exist, falls through to connect-static
if they don't, or if browser does not send 'Accept-Encoding' header.

You should use `connect-gzip-static-html` if your build process already creates gzipped files. If you
want to gzip your data on the fly use built-in [connect compress][] middleware. And if you want to
gzip your files dynamically you may want to look up [connect gzip][].

## Installation

	  $ npm install connect-gzip-static-html

## Options

gzip-static is meant to be a drop in replacement for [connect static][] middleware. Use the same
options as you would with [connect static][].


## Usage

```javascript
var gzipStatic = require('connect-gzip-static-html');
var oneDay = 86400000;

connect()
  .use(gzipStatic(__dirname + '/public'))

connect()
  .use(gzipStatic(__dirname + '/public', { maxAge: oneDay }))
```

## How it works

`gzip-static` starts by locating all compressed files (ie. _files with `.gz` extension_) in `root` directory. All `HTTP GET` and `HTTP HEAD` requests with `Accept-Encoding` header set to `gzip` are checked against the list of compressed files and, if possible, fulfilled by returning the compressed versions. If compressed version is not found or if the request does not have an appropriate `Accept-Encoding` header, the request is processed in the same way as standard `static` middleware would handle it.

## Debugging

This project uses [debug module](https://github.com/visionmedia/debug). To enable the debug log, just set the debug enviromental variable: `DEBUG="connect:gzip-static"`

# License

MIT

[connect]: http://www.senchalabs.org/connect
[connect static]: http://www.senchalabs.org/connect/static.html
[connect compress]: http://www.senchalabs.org/connect/compress.html
[connect gzip]: https://github.com/tikonen/connect-gzip
[connect gzip static]: https://github.com/code42day/connect-gzip-static
