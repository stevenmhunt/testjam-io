const EventEmitter = require('events');
const _ = require('lodash');

const hub = new EventEmitter();

hub.getTheme = () => window.localStorage.theme;
hub.setTheme = (t) => {
    window.localStorage.theme = t;
    return hub.emit('themeChanged', t);
};

hub.test = () => hub.emit('test');
hub.like = () => hub.emit('liked');
hub.unlike = () => hub.emit('unliked');

hub.execute = (text, logger) => {
    const [command, ...args] = (text || '').split(' ');
    logger.log(`$ ${text}\n`);
    if (hub[command] && _.isFunction(hub[command])) {
        try {
            logger.log(hub[command](...args));
        }
        catch (err) {
            logger.log(`${err.name}: ${err.message}`);
        }
        logger.log('\n');
    }
    else {
        logger.log(`CommandError: command '${command}' not found.\n`)
    }
};

window.testjam = {
    setTheme: (t) => hub.setTheme(t),    
    test: () => hub.test()
};

module.exports = hub;

setImmediate(() => {
    if (window.localStorage.theme) {
        hub.setTheme(window.localStorage.theme);
    }
});