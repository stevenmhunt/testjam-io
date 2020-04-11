const EventEmitter = require('events');

const hub = new EventEmitter();

hub.setTheme = t => hub.emit('themeChanged', t);
hub.runTests = () => hub.emit('runTests');

window.testjam = {
    setTheme: (t) => hub.setTheme(t),
    runTests: () => hub.runTests()
};

module.exports = hub;
