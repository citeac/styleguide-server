var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');
var only = require('only');
var version = require('./package.json').version;


// map each guide to its id
var guides = require('./guides');
var map = {};
guides.forEach(function(g){ map[g.id] = g });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// middleware to add some useful headers
app.use(function(req, res, next){
  res.setHeader('X-Cite-JS-Server-Version', version);
  next();
})


// useful route to say hello
app.get('/', function(req, res) {
  res.send('Hello World!');
});


// useful route to show available guides
app.get('/guides', function(req, res) {
  var mapped = guides.map(function(a){ return only(a, 'id title version')});
  res.send(mapped);
});


// get meta information regarding the styleguide
app.get('/guides/:id', function(req, res) {
  var guide = map[req.params.id];
  if (!guide) return res.status(404).send('no guide with id: "' + req.params.id + '"');
  res.send(only(guide, 'id title version'));
});



// get available styles
app.get('/guides/:id/styles', function(req, res) {
  var guide = map[req.params.id];
  if (!guide) return res.status(404).send('no guide with id: "' + req.params.id + '"');

  var arr = [];
  var styles = guide.styles;
  var q = req.query;

  for (var key in styles) {
    var style = styles[key];

    if (q.sourcetype && style.sourceType !== q.sourcetype) {
      continue;
    }

    if (q.search) {
      var str = q.search.toLowerCase().replace('+', ' ');
      var title = style.title.toLowerCase();
      var desc = style.description.toLowerCase();

      if (!~title.indexOf(str) && !~desc.indexOf(str)) continue;
    }

    arr.push(only(style, 'id title description sourceType'));
  }

  res.send(arr);
});



// run style with data and return result
app.post('/guides/:gid/styles/:id/run', function(req, res, next){
  var guide = map[req.params.gid];
  if (!guide) return res.status(404).send('no guide with id: "' + req.params.gid + '"');

  var style = guide.styles[req.params.id];
  if (!style) return res.status(404).send('style not found');

  var data = req.body.data;
  var runner = guide.run(style, data);
  res.send(runner);
})

// get more specific information about styles
app.get('/guides/:gid/styles/:id', function(req, res) {
  var guide = map[req.params.gid];
  if (!guide) return res.status(404).send('no guide with id: "' + req.params.gid + '"');

  var style = guide.styles[req.params.id];
  if (!style) return res.status(404).send('style not found');
  res.send(style);
});



// start server
app.listen(8080);
console.log("Listening on 8080");