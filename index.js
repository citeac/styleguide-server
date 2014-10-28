var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');
var only = require('only');
var version = require('./package.json').version;

/**
 * some magic happens here, where we `require()`
 * the styleguide by name, which is specified in
 * the enviromental variable STLEGUIDE
 *
 * if there is no STYLEGUIDE, then an error will
 * be thrown.
 *
 */

var SG = process.env.STYLEGUIDE;
if (!SG) throw new Error('must specify a STYLEGUIDE Env Var');

var styleguide = require(SG);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// middleware to add some useful headers
app.use(function(req, res, next){
  res.setHeader('x-Styleguide-ID', styleguide.id);
  res.setHeader('x-Styleguide-Version', styleguide.version);
  res.setHeader('x-Styleguide-Server-Version', version);
  next();
})



// useful route to say hello
app.get('/', function(req, res) {
  res.send('Hello World!');
});



// get meta information regarding the styleguide
app.get('/meta', function(req, res) {
  res.send(only(styleguide, 'id title version'));
});



// get available styles
app.get('/styles', function(req, res) {
  var arr = [];
  var styles = styleguide.styles;
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



// get more specific information about styles
app.get('/styles/:id', function(req, res) {
  var style = styleguide.styles[req.params.id];
  if (!style) return res.status(404).send('style not found');
  res.send(style);
});



// run style with data and return result
app.post('/run', function(req, res, next){
  var id = req.body.id;
  var data = req.body.data;
  var style = styleguide.styles[id];

  if (!style) return res.status(404).send('style not found');
  var runner = styleguide.run(style, data);

  res.send(runner);
})



// start server
app.listen(8080);
console.log("Listening on 8080");