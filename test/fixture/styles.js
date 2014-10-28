module.exports = exports = [];


/**
 * A Style
 *
 * @id TEST001
 */

exports.push(function(){
  this
  .atleast('doi', 'title')
  .trait('title, ')
  .trait('doi, ')
  .trait('publisher')
  .if('publisher', function(){
    this.set('doi', function(a){
      a.show();
    })
  })
})



/**
 * a different style
 *
 * @id TEST002
 */

exports.push(function(){
  this
  .trait('editor, ')
  .trait('datePublished, ')
})