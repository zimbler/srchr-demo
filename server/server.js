var express   = require('express'),
    fs        = require('fs'),
    search    = require('server/search.js'),
    favs      = require('server/favorites.js'),
    site      = express.createServer(),
    staticDir = express['static'],
    _         = require('underscore');

module.exports = function(opts) {
  opts = _.extend({
    port : 4444,
    tests : true
  }, opts || {});

  site.configure(function() {
    [ 'app', 'lib', 'assets', 'tests' ].forEach(function(dir) {
      site.use('/' + dir, staticDir('./' + dir));
    });
    site.use(express.bodyParser());
  });

  site.get("/", function(req, res) {
    fs.createReadStream('./app/index.html').pipe(res);
  });

  site.get("/search/:term", function(req, res) {
    var term = req.params.term;

    search(req.params.term).then(
      function(data) {
        res.end(JSON.stringify(data));
      },
      function(statusCode) {
        throw new Error();
      }
    );
  });

  site.post("/favorites", function(req, res) {
    var fav = JSON.parse(req.body.favorite);
    var id = favs.add(fav);
    res.end(JSON.stringify({ id : id }));
  });

  site.put("/favorites/:id", function(req, res) {
    var fav = JSON.parse(req.body.favorite);
    var id = favs.update(req.params.id, fav);
    res.end(JSON.stringify({ id : id }));
  });

  site.delete("/favorites/:id", function(req, res) {
    favs.remove(req.params.id);
    res.end(JSON.stringify({ success : true }));
  });

  site.get("/favorites", function(req, res) {
    res.end(JSON.stringify(favs.get()));
  });

  site.get("/favorites/:id", function(req, res) {
    var fav = favs.get(req.params.id);
    res.end(JSON.stringify(fav));
  });

  if (opts.tests) {
    site.get("/test", function(req, res) {
      fs.createReadStream('./tests/app/runner.html').pipe(res);
    });
  }

  // Actually listen
  site.listen(opts.port);
  console.log("Serving at http://localhost:" + opts.port);
};