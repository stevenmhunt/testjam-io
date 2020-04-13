
function get(key) {
    return window.localStorage[key];
}

function exists(key) {
    return get(key) !== undefined;
}

function set(key, value) {
    window.localStorage[key] = value;
}

function global(name) {
    return window[name];
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function page(p = null) {
    if (!p) {
        return getQueryVariable('p');
    }
    history.pushState(null, '', `/?p=${p}`);
}

function enableApp() {
    document.getElementById('app').style.opacity = 1;
    document.getElementById('loading').style.display = 'none';
}

module.exports = {
    get, set, exists,
    global, page, enableApp
};
