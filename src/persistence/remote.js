export default
class Remote {
    constructor(hub) {
        this.hub = hub;
    }

    getValue(key) {
        return window.localStorage[key];
    }

    setValue(key, value) {
        window.localStorage[key] = value;
    }
}