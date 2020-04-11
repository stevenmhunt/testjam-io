const EventEmitter = require('events');

export default
class Logger {
    constructor() {
        this.events = new EventEmitter();
    }
    log(data) {
        this.events.emit('logInfo', data);
        this.events.emit('output', data);
    }
    warn(data) {
        this.events.emit('logWarn', data);
        this.events.emit('output', data);
    }
    error(data) {
        this.events.emit('logError', data);
        this.events.emit('output', data);
    }
    info(data) {
        this.events.emit('logInfo', data);
        this.events.emit('output', data);
    }
    debug(data) {
        this.events.emit('logDebug', data);
        this.events.emit('output', data);
    }
    clear() {
        this.events.emit('clear');
    }
    on(name, fn) {
        this.events.on(name, fn);
    }
}
