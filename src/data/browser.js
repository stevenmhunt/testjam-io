/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
/**
 * Gets or sets a  local storage value.
 * @param {string} key The value to get.
 * @param {string} value The value to set (performs a get if omitted)
 * @returns {string} the value.
 */
function local(key, value) {
    if (value === undefined) {
        return window.localStorage[key];
    }
    window.localStorage[key] = value;
    return undefined;
}

/**
 * Retrieves the specified global.
 * @param {string} name The name of the global object to retrieve.
 * @returns {object} The requested global object.
 */
function global(name) {
    return window[name];
}

/**
 * @private
 * Extracts the requested query string parameter from the current URL.
 * @param {string} param The name of the query string parameter.
 */
function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i += 1) {
        const pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return undefined;
}

/**
 * Gets or sets the current page id.
 * @param {string} p The page id to load
 * @returns {string} the current page id.
 */
function page(p = null) {
    if (!p) {
        return getQueryVariable('p');
    }
    history.replaceState(null, '', `/?p=${p}`);
    return undefined;
}

/**
 * Gets or sets the title of the page.
 * @param {string} t The title to set.
 * @returns {string} The title of the page.
 */
function title(t = null) {
    if (!t) {
        return document.title;
    }
    document.title = `${t} - testjam.io`;
    return undefined;
}

/**
 * Enables the application after loading has completed.
 */
function enableApp() {
    document.getElementById('app').style.opacity = 1;
    document.getElementById('loading').style.display = 'none';
    console.log('App is ready.');
}

module.exports = {
    local, global, page, title, enableApp,
};
