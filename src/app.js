const EventEmitter = require('events');
const _ = require('lodash');
const { parse } = require('shell-quote');
const { browser, remote } = require('./data');
const { npm } = require('./packages');
import { loadRuntime, executeRuntime } from './runtime';
import { runtimes, themes } from '../config';
import errorFormatter from './formatters/errorFormatter';

import Logger from './Logger';

const cache = {
    runtime: 'CucumberJS 6.x',
    isTestingEnabled: true,
    isTestRunning: false
};

const app = {
    logger: new Logger()
};

const hub = new EventEmitter();

app.getThemes = () => themes;
app.getTheme = () => browser.get('theme');
app.setTheme = (t) => {
    if (themes.indexOf(t) >= 0) {
        browser.set('theme', t);
        return Promise.resolve(hub.emit('themeChanged', t));
    }
    return Promise.reject(new Error(`Unrecognized theme '${t}'.`));
};

const enableTests = () => {
    cache.isTestingEnabled = true;
    hub.emit('testsEnabled');
}

const disableTests = () => {
    cache.isTestingEnabled = false;
    hub.emit('testsDisabled');
}

const startTests = () => {
    cache.isTestRunning = true;
    hub.emit('testsStarted');
}

const endTests = () => {
    cache.isTestRunning = false;
    hub.emit('testsEnded');
}

function runTestsInternal() {
    try {
        startTests();
        const packages = {};

        app.getPackages().then((pkgData) => {
            pkgData.forEach((pkg) => {
                packages[pkg.name] = window[_.camelCase(pkg.name)];
            });
        })
            .then(() => loadRuntime(app.getRuntime()))
            .then(() => executeRuntime(app.getRuntime(), {
                features: app.getFeatures(),
                stepDefinitions: app.getStepDefinitions(),
                packages,
                logger: app.logger
            })).then((success) => {
                if (success) {
                    app.logger.log('\nCucumberJS exited with status code 0.\n\n');
                }
                else {
                    app.logger.log('\nCucumberJS exited with status code 1.\n\n');
                }
                endTests();
            }).catch((err) => {
                app.logger.error(errorFormatter(err));
                endTests();
            });
    }
    catch (err) {
        app.logger.error(errorFormatter(err));
        endTests();
    }
};

let testWaitFlag = false;

app.test = () => {
    if (cache.isTestingEnabled && !cache.isTestRunning) {
        return runTestsInternal();
    }
    else if (!testWaitFlag) {
        testWaitFlag = true;
        return new Promise((resolve) => {
            hub.once(!cache.isTestingEnabled ? 'testsEnabled' : 'testsEnded', () => {
                testWaitFlag = false;
                resolve(runTestsInternal());
            });
        });
    }
};
app.cucumber = app.test;

app.like = () => hub.emit('liked');
app.unlike = () => hub.emit('unliked');

app.getRuntimes = () => runtimes;
app.getRuntime = () => cache.runtime;
app.setRuntime = (r) => {
    if (runtimes.indexOf(r) >= 0) {
        cache.runtime = r;
        disableTests();
        return loadRuntime(r)
            .then(() => {
                enableTests();
                hub.emit('runtimeChanged', r);
            });
    }
    return Promise.reject(new Error(`Unrecognized runtime '${r}'.`));
};

app.getPackages = () => {
    disableTests();
    return npm.getPackages()
        .then((result) => {            
            enableTests();
            return result;
        });
}

app.addPackage = (name, version) => {
    disableTests();
    return npm.addPackage(name, version)
        .then((result) => {
            enableTests();
            return result;
        });
}

app.removePackage = (name) => {
    return npm.removePackage(name);
}

app.getFeatures = () => cache.features || [];
app.setFeature = (id, name, source) => {
    cache.features = cache.features || [];
    const selected = cache.features.filter(i => i.id === id)[0];
    if (selected) {
        selected.name = name;
        selected.source = source;
    }
    else {
        cache.features.push({ id, name, source });
    }
    return Promise.resolve();
}

app.getStepDefinitions = () => cache.steps || [];
app.setStepDefinition = (id, name, source) => {
    cache.steps = cache.steps || [];
    const selected = cache.steps.filter(i => i.id === id)[0];
    if (selected) {
        selected.name = name;
        selected.source = source;
    }
    else {
        cache.steps.push({ id, name, source });
    }
    return npm.scanForPackages(source)
        .then(() => enableTests());
}

app.execute = (text) => {
    const { logger } = app;
    const [command, ...args] = parse(text || '');
    logger.log(`$ ${text}\n`);
    if (app[command] && _.isFunction(app[command])) {
        try {
            const result = app[command](...args);
            if (result && result.then) {
                result.then(r => logger.log(r));
            }
            else {
                logger.log(result);
            }
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

app.on = hub.on.bind(hub);

module.exports = app;

setImmediate(() => {
    app.setTheme(browser.exists('theme') ? browser.get('theme') : 'Light');
});