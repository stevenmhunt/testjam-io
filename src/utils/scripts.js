function executeScriptUrl(id, url) {
    if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.id = id;
        script.type = 'text/javascript';
        script.async = false;
        script.src = url;
        document.getElementsByTagName('html')[0].appendChild(script);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

function executeScript(id, code) {
    if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = false;
        script.innerHTML = code;
        document.getElementsByTagName('html')[0].appendChild(script);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

const INTERVAL = 50;
const TIMEOUT = 5000;

function waitUntilExists(name, returns) {
    return new Promise((resolve, reject) => {
        let handle = null, count = 0;
        handle = setInterval(() => {
            count += 1;
            if (window[name]) {
                clearInterval(handle);
                resolve(returns);
            }

            if (count >= (TIMEOUT / INTERVAL)) {
                clearInterval(handle);
                reject(new Error(`Unable to find '${name}' within ${TIMEOUT} millseconds.`));
            }
        }, INTERVAL);
    });
}

function loadStackChain(name, version) {
    return executeScript(name, `
    window._stackChain = { version: '${version}' };
    window._stackChain.prepareStackTrace = function () { };
    window._stackChain.filter = {
        attach: function () { },
        deattach: function () { }
    };`);
}

module.exports = {
    executeScriptUrl,
    executeScript,
    loadStackChain,
    waitUntilExists
};
