var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');
var only = require('only');
var version = require('./package.json').version;


// map each style to its id
var styles = require('./styles');
var map = {};
styles.forEach(function(g){ map[g.id] = g });


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


// useful route to show available styles
app.get('/styles', function(req, res) {
  var mapped = styles.map(function(a){ return only(a, 'id title version')});
  res.send(mapped);
});


// get meta information regarding the styleguide
app.get('/styles/:id', function(req, res) {
  var style = map[req.params.id];
  if (!style) return res.status(404).send('no style with id: "' + req.params.id + '"');
  res.send(only(style, 'id title version'));
});



// get available types
app.get('/styles/:id/types', function(req, res) {
  var style = map[req.params.id];
  if (!style) return res.status(404).send('no style with id: "' + req.params.id + '"');

  var arr = [];
  var types = style.types;

  for (var key in types) {
    var type = types[key];
    arr.push(only(type, 'id title description types'));
  }

  res.send(arr);
});



// get more specific information about styles
app.get('/styles/:gid/types/:id', function(req, res) {
  var style = map[req.params.gid];
  if (!style) return res.status(404).send('no style with id: "' + req.params.gid + '"');

  var type = style.types[req.params.id];
  if (!type) return res.status(404).send('type not found');
  res.send(only(type, 'id title description code tags types'));
});


// run style with data and return result
app.post('/styles/:gid/types/:id/run', function(req, res, next){
  var style = map[req.params.gid];
  if (!style) return res.status(404).send('no style with id: "' + req.params.gid + '"');

  var type = style.types[req.params.id];
  if (!type) return res.status(404).send('type not found');

  var data = req.body.data;
  var runner = style.run(type, data);
  res.send(runner);
})


// start server
app.listen(8080);
console.log("Listening on 8080");