var send = require('send');
var debug = require('debug')('connect:gzip-static');
var parseUrl = require('parseurl');
var path = require('path');
var mime = send.mime;
var find = require('find');

function setHeader(res, path) {
  var type = mime.lookup(path);
  var charset = mime.charsets.lookup(type);

  debug('content-type %s', type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Vary', 'Accept-Encoding');
}


function createCache(root) {
  var cache = Object.create(null);
  find.fileSync(/\.gz$/, root).forEach(function(file) {
    cache[file] = true;
  });
  debug('Found %d compressed files', Object.keys(cache).length);
  return cache;
}


function createHtmlCache(root) {
  var cache = Object.create(null);
  find.fileSync(/\.html$/, root).forEach(function(file) {
    cache[file.slice(0, - 5)] = true;
  });
  debug('Found %d html files', Object.keys(cache).length);
  return cache;
}

module.exports = function(root, options) {
  var serveStatic, gzipCache = createCache(root), HtmlCache = createHtmlCache(root);

  options = options || {};
  options.index = options.index || 'index.html';
  serveStatic = require('serve-static')(root, options);

  return function gzipStatic(req, res, next) {
    var acceptEncoding, passToStatic, name = {};

    if ('GET' != req.method && 'HEAD' != req.method) {
      return next();
    }

    var filename = parseUrl(req).pathname;
    var isIndex = filename[filename.length - 1] === '/';

    if (filename.indexOf('.')===-1 && !isIndex)
    {
      if (HtmlCache[path.join(root, filename)])
      {
        filename += '.html';
        var querypos = req.url.indexOf('?');
        req.url = querypos === -1 ? req.url + ".html" :  req.url.substr(0, querypos) +".html" + req.url.substr(querypos);
      }
    }

    passToStatic = serveStatic.bind(this, req, res, next);

    acceptEncoding = req.headers['accept-encoding'] || '';
    if (!~acceptEncoding.indexOf('gzip')) {
      debug('Passing %s', req.url);
      return passToStatic();
    }

    name.orig = filename;
    if (isIndex) {
      name.gz = name.orig;
      name.orig += options.index;
      name.index = options.index + '.gz';
    } else {
      name.gz = name.orig + '.gz';
    }
    name.full = path.join(root, name.orig + '.gz');
    debug('request %s, check for %s', req.url, name.full);

    if (!gzipCache[name.full]) {
      debug('Passing %s', req.url);
      return passToStatic();
    }

    debug('Sending %s', name.full);
    setHeader(res, name.orig);
    send(req, name.gz)
      .maxage(options.maxAge || 0)
      .root(root)
      .index(name.index)
      .hidden(options.hidden)
      .on('error', next)
      .pipe(res);
  };
};
