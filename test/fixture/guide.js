
/*!
 * Dependencies
 */

var StyleGuide = module.exports = require('styleguide')();


/*!
 * Setup configuration
 */

StyleGuide.config({
  "id": "test-guide",
  "title": "Test Guide",
  "version": "0.1.0"
});


/*!
 * Load Styles
 */

StyleGuide
.path(__dirname)
.add('Example', './styles');