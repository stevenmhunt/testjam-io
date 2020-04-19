const EventEmitter = require('events');
const _ = require('lodash');
const { parse } = require('shell-quote');
const { browser, firebase } = require('./data');
const { npm } = require('./packages');
import { loadRuntime, executeRuntime } from './runtime';
import { runtimes, themes, featureSource, stepSource } from '../config';
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

// User Authentication

firebase.onAuthChanged(({ action, user }) => {
    if (action === 'signIn') {
        firebase.loadUser()
            .then((u) => {
                cache.user = u || {};
                cache.user.uid = user.uid;
                if (cache.user.photo !== user.photoURL) {
                    cache.user.photo = user.photoURL;
                    cache.user.isPhotoChanged = true;
                }
                if (cache.user.name !== user.displayName) {
                    cache.user.name = user.displayName;
                    cache.user.isNameChanged = true;
                }
                if ((cache.user.likes || []).indexOf(browser.page()) >= 0) {
                    setImmediate(() => hub.emit('liked'));
                }
                hub.emit('signedIn', cache.user);
            });
    }
    else {
        hub.emit('signedOut');
    }
});

app.signIn = () => firebase.signIn()
    .then(user => hub.emit('signedIn', user));

app.signOut = () => {
    firebase.signOut();
    hub.emit('signedOut');
};


const getOwner = () => cache.owner;
const setOwner = (owner) => {
    cache.owner = owner;
    hub.emit('ownerChanged', owner);
}

// Persistence

function loadJam() {
    const id = browser.page();
    if (!id) {
        return Promise.all([
            Promise.resolve(setOwner(null)),
            Promise.resolve(app.setName('New Jam')),
            app.setFeature({ id: 1, name: 'test.feature', source: featureSource }),
            app.setStepDefinition({ id: 1, name: 'steps.js', source: stepSource })
        ]);
    }
    return firebase.getJam(id)
        .then(jam => Promise.all([
            Promise.resolve(setOwner({ uid: jam.uid, name: jam.createdBy.name, photo: jam.createdBy.photo })),
            Promise.resolve(app.setName(jam.name)),
            Promise.resolve(app.setFork(jam.fork)),
            app.setRuntime(jam.runtime),
            ...(jam.features.map(i => app.setFeature(i))),
            ...(jam.stepDefinitions.map(i => app.setStepDefinition(i)))
        ]));
}

app.save = () =>
    Promise.resolve(hub.emit('saving'))
        .then(() => firebase.saveJam(browser.page(), {
            name: app.getName(),
            runtime: app.getRuntime(),
            features: app.getFeatures(),
            stepDefinitions: app.getStepDefinitions()
        })).then((id) => {
            hub.emit('saved', id);
            if (id) {
                browser.page(id);
                return loadJam();
            }
        });

app.fork = () =>
    Promise.resolve(hub.emit('forking'))
        .then(() => firebase.forkJam(browser.page(), {
            name: app.getName(),
            runtime: app.getRuntime(),
            features: app.getFeatures(),
            stepDefinitions: app.getStepDefinitions(),
            createdBy: getOwner()
        })).then((id) => {
            hub.emit('forked', id);
            browser.page(id);
            return loadJam();
        });

app.getMyJams = () => {
    if (!cache.myJams) {
        return firebase.getMyJams()
            .then((jams) => {
                cache.myJams = jams.map(jam => Object.assign({}, jam, {
                    dateUpdated: new Date(jam.dateUpdated._seconds * 1000)
                }));
                hub.emit('myJamsLoaded', cache.myJams);
                return cache.myJams;
            });
    }    
    hub.emit('myJamsLoaded', cache.myJams);
    return Promise.resolve(cache.myJams);
}

// Theme Management

app.getThemes = () => themes;
app.getTheme = () => browser.local('theme');
app.setTheme = (t) => {
    if (themes.indexOf(t) >= 0) {
        browser.local('theme', t);
        return Promise.resolve(hub.emit('themeChanged', t));
    }
    return Promise.reject(new Error(`Unrecognized theme '${t}'.`));
};

app.getName = () => cache.name;
app.setName = (name) => {
    cache.name = name;
    browser.title(name);
    hub.emit('nameChanged', name);
};

app.getFork = () => cache.fork;
app.setFork = (fork) => {
    cache.fork = fork;
    hub.emit('forkChanged', fork);
};

// Test Execution

/**
 * @private
 */
const enableTests = () => {
    cache.isTestingEnabled = true;
    hub.emit('testsEnabled');
}

/**
 * @private
 */
const disableTests = () => {
    cache.isTestingEnabled = false;
    hub.emit('testsDisabled');
}

/**
 * @private
 */
const startTests = () => {
    cache.isTestRunning = true;
    hub.emit('testsStarted');
}

/**
 * @private
 */
const endTests = (err) => {
    cache.isTestRunning = false;
    hub.emit('testsEnded', err);
}

/**
 * @private
 */
function runTestsInternal() {
    try {
        startTests();
        const packages = {};

        app.getPackages().then((pkgData) => {
            pkgData.forEach((pkg) => {
                packages[pkg.name] = browser.global(_.camelCase(pkg.name));
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
                endTests(!success);
            }).catch((err) => {
                app.logger.error(errorFormatter(err));
                endTests(err);
            });
    }
    catch (err) {
        app.logger.error(errorFormatter(err));
        endTests(err);
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

// Favorites

app.like = () => Promise.resolve(hub.emit('changingLike'))
    .then(() => firebase.likeJam(browser.page()))
    .then(() => Promise.resolve(hub.emit('liked')));

app.unlike = () => Promise.resolve(hub.emit('changingLike'))
.then(() => firebase.unlikeJam(browser.page()))
.then(() => Promise.resolve(hub.emit('unliked')))

// Runtime Management

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

// Package Management

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

// Feature Files

app.getFeatures = () => cache.features || [];
app.setFeature = ({ id, name, source }) => {
    cache.features = cache.features || [];
    const selected = cache.features.filter(i => i.id === id)[0];
    if (selected) {
        selected.name = name;
        selected.source = source;
    }
    else {
        cache.features.push({ id, name, source });
    }

    hub.emit('featureUpdated', { id, name, source });
    return Promise.resolve();
}

// Step Definitions

app.getStepDefinitions = () => cache.steps || [];
app.setStepDefinition = ({ id, name, source }) => {
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
        .then(() => hub.emit('stepDefinitionUpdated', { id, name, source }))
        .then(() => enableTests(), (err) => {
            disableTests();
            throw err;
        });
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

setTimeout(() => {
    const theme = browser.local('theme') ? browser.local('theme') : app.getThemes()[0];
    loadJam()
        .then(() => app.setTheme(theme))
        .then(() => browser.enableApp())
        .then(() => setImmediate(() => {
            // after the page loads, start running tests.
            if (browser.page()) {
                app.test();
            }
        }))
        .catch((err) => {
            document.getElementById('loadingIcon').className = 'fa fa-warning';
            document.getElementById('loadingMessage').innerHTML = `${err.name}: ${err.message}`;
        });
}, 800);