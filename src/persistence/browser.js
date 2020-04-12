
function get(key) {
    return window.localStorage[key];
}

function exists(key) {
    return get(key) !== undefined;
}

function set(key, value) {
    window.localStorage[key] = value;
}

module.exports = {
    get, set, exists
};
