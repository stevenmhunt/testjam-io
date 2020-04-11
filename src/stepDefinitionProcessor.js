const _ = require('lodash');

module.exports = function stepDefinitionProcessor({ source, id }) {
    const result = `
    function require(i) {
        if (!__dependencies[i]) {
            throw new Error(\`Cannot find module '\${i}'.\`);
        }
        return __dependencies[i];
    }

    function ${id}() {
        ${source}
    }
    
    return ${id}();
    `;
    return result;
};
