const EventEmitter = require('events');
const _ = require('lodash');
const { parse } = require('shell-quote');
const { browser, remote } = require('./persistence');
const { runtimes, themes } = require('../config');

const cache = {
    runtime: 'CucumberJS 6.x'
};

const hub = new EventEmitter();

hub.getThemes = () => themes;
hub.getTheme = () => browser.get('theme');
hub.setTheme = (t) => {
    if (themes.indexOf(t) >= 0) {
        browser.set('theme', t);
        return hub.emit('themeChanged', t);
    }
    throw new Error(`Unrecognized theme '${t}'.`);
};

hub.test = (...args) => hub.emit('test', ...args);
hub.cucumber = (...args) => hub.emit('test', ...args);

hub.like = () => hub.emit('liked');
hub.unlike = () => hub.emit('unliked');

hub.getRuntimes = () => runtimes;
hub.getRuntime = () => cache.runtime;
hub.setRuntime = (r) => {
    if (runtimes.indexOf(r) >= 0) {
        cache.runtime = r;
        return hub.emit('runtimeChanged', r);
    }
    throw new Error(`Unrecognized runtime '${r}'.`);
};

hub.execute = (text, logger) => {
    const [command, ...args] = parse(text || '');
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

module.exports = hub;

setImmediate(() => {
    if (browser.exists('theme')) {
        hub.setTheme(browser.get('theme'));
    }
});