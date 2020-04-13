const _ = require('lodash');

module.exports = function stepDefinitionFormatter({ source, id }) {
    const result = `
    function require(i) {
        if (!__dependencies[i]) {
            throw new Error(\`Cannot find module '\${i}'.\`);
        }
        return __dependencies[i];
    }

    function fn_${id}() {
        ${source}
    }
    
    return fn_${id}.call(this);
    `;
    return result;
};
