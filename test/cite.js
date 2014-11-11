var request = require('supertest');
var expect = require('expect.js');
var version = require('../package.json').version;

var guides = require('../guides');
guides[0] = require('./fixture/guide')
var app = require('../');

describe('cite-js-server', function(){
  describe('GET /', function(){
    it('should respond correctly', function(done){
      request(app)
        .get('/')
        .expect('x-Cite-JS-Server-Version', version)
        .expect('Hello World!')
        .expect(200, done)
    })
  })

  describe('GET /guides', function(){
    it('should respond correctly', function(done){
      request(app)
        .get('/guides')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body[0]).to.eql({ id: 'test-guide', title: 'Test Guide', version: '0.1.0' })
          done();
        })
    })
  })

  describe('GET /guides/:id/meta', function(){
    it('should respond correctly', function(done){
      request(app)
        .get('/guides/test-guide')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body).to.eql({ id: 'test-guide', title: 'Test Guide', version: '0.1.0' })
          done();
        })
    })
  })

  describe('GET /guides/:id/styles', function(){
    it('should get all correctly', function(done){
      request(app)
        .get('/guides/test-guide/styles')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body).to.have.length(2);
          expect(res.body[0].id).to.eql('TEST001')
          expect(res.body[0]).to.only.have.keys('id', 'title', 'description', 'sourceType')
          expect(res.body[1].id).to.eql('TEST002')
          expect(res.body[1]).to.only.have.keys('id', 'title', 'description', 'sourceType')
          done();
        })
    })

    it('should find by description', function(done){
      request(app)
        .get('/guides/test-guide/styles?search=different+style')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body).to.have.length(1);
          expect(res.body[0].id).to.eql('TEST002')
          expect(res.body[0]).to.only.have.keys('id', 'title', 'description', 'sourceType')
          done();
        })
    })

    it('should fail by description', function(done){
      request(app)
        .get('/guides/test-guide/styles?search=whatever')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body).to.have.length(0);
          done();
        })
    })
  })

  describe('GET /guides/:gid/styles/:id', function(){
    it('finds style by id', function(done){
      request(app)
        .get('/guides/test-guide/styles/TEST002')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body.id).to.eql('TEST002')
          expect(res.body).to.only.have.keys('id', 'title', 'description', 'code', 'tags', 'sourceType')
          done();
        })
    })

    it('fails', function(done){
      request(app)
        .get('/styles/sdfknsldk')
        .expect(404, done)
    })
  })


  describe('POST /guides/:gid/styles/:id/run', function(){
    it('fails', function(done){
      request(app)
        .post('/guides/test-guide/styles/foo/run')
        .expect(404, done)
    })

    it('should return at least error', function(done){
      request(app)
        .post('/guides/test-guide/styles/TEST001/run')
        .send({})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body.validators).to.have.length(1);
          expect(res.body.validators[0].type).to.eql('atleast');
          expect(res.body.validators[0].failed).to.be(true);

          expect(res.body.errors).to.have.length(1);
          expect(res.body.errors[0].message).to.eql('atleast');
          expect(res.body.string).to.eql('');
          done();
        })
    })

    it('should not return at least error', function(done){
      request(app)
        .post('/guides/test-guide/styles/TEST001/run')
        .send({data: { title: 'foo bar', doi: 'baz'}})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body.validators).to.have.length(1);
          expect(res.body.validators[0].type).to.eql('atleast');
          expect(res.body.validators[0].failed).to.be(undefined);

          expect(res.body.errors).to.have.length(0);
          expect(res.body.string).to.eql('foo bar, baz,');
          done();
        })
    })

    it('should have correct validators and errors when `.if()` is triggered', function(done){
      request(app)
        .post('/guides/test-guide/styles/TEST001/run')
        .send({data: {title: 'f', publisher:'abc'}})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body.validators).to.have.length(2);
          expect(res.body.validators[0].type).to.eql('atleast');
          expect(res.body.validators[0].failed).to.be(undefined);
          expect(res.body.validators[0].overridden).to.be(true);
          expect(res.body.validators[1].type).to.eql('requires');
          expect(res.body.validators[1].failed).to.be(true);

          expect(res.body.errors).to.have.length(1);
          expect(res.body.errors[0].message).to.eql('requires');
          done();
        })
    })

    it('should have correct validators and errors when `.if()` is triggered', function(done){
      request(app)
        .post('/guides/test-guide/styles/TEST001/run')
        .send({data: {title: 'f', publisher:'abc', doi:'baz'}})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          expect(res.body.validators).to.have.length(2);
          expect(res.body.validators[0].type).to.eql('atleast');
          expect(res.body.validators[0].failed).to.be(undefined);
          expect(res.body.validators[0].overridden).to.be(true);
          expect(res.body.validators[1].type).to.eql('requires');
          expect(res.body.validators[1].failed).to.be(undefined);

          expect(res.body.errors).to.have.length(0);
          expect(res.body.string).to.eql('f, baz, abc');
          done();
        })
    })
  })
})