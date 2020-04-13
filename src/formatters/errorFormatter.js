const stackFormatter = require('./stackFormatter');

module.exports = function errorFormatter(err) {
    return `${err.name}: ${err.message}\n\n${stackFormatter(err.stack).split('\n').filter(i => i.indexOf('step_definitions') >= 0)}`;
}
