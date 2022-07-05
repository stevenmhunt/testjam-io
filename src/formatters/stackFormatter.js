module.exports = function stackFormatter(stack) {
    const ignoreLines = [
        '_asyncToGenerator',
        'run@',
        '_callee$@',
        'tryCatch@',
        'invoke@',
        'webpack',
        'defineIteratorMethods',
        'asyncGeneratorStep@',
        '_next@',
    ];

    // example lines:
    //      d873hfh74ryhrh7@/js/client.js line 1897 > eval line 75 > Function:13:67
    // ?[90md873hfh74ryhrh7/<@/js/client.js line 1897 > eval line 75 > Function:44:36
    /* const fnNameData = (line || '').split(/[\@\/]+/)[0].split('[');
    const fnName = fnNameData.length === 1 ? fnNameData[0] :
        fnNameData[fnNameData.length - 1].trim().substring(3);
    const prefix = fnNameData.length === 1 ? '' :
        `${fnNameData[0]}[${fnNameData[fnNameData.length - 1].substring(0, 3)}`;
    const suffix = fnNameData.length === 1 ? '' : `${fnNameData[0].trim()}[39m`;
    const keys = this.tracked.stepDefinitions.map(i => i.id);
    if (fnName && keys.indexOf(fnName) >= 0) {
        const { name } = this.tracked.stepDefinitions.filter(i => i.id === fnName)[0];
        const [ l, c ] = line.split('Function:')[1].split(':');
        return `${prefix}${name}:${(parseInt(l, 10) - 11)}:${(parseInt(c, 10) - 0)}${suffix}`;
    } */
    return (stack || '').split('\n').map((line) => line).filter((i) => ignoreLines.filter((l) => i.indexOf(l) >= 0).length === 0).join('\n');
};
