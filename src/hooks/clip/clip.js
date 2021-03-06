const
    errors = require('feathers-errors'),
    config = require('../../config.js');

function addUrl (hooks) {
  let slug = hooks.result.slug || hooks.result.id;
  hooks.result.podverseUrl = `${config.baseUrl}/clips/${slug}`;
}

module.exports = {
  addUrl
};
