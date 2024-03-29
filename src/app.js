/* eslint-disable prefer-template */
/* eslint-disable no-console */
import { dialects } from '@cucumber/gherkin';
import runtimes from './runtimes';
import languages from './languages';
import {
    themes, featureSource,
} from '../config';
import errorFormatter from './formatters/errorFormatter';

import Logger from './Logger';

const EventEmitter = require('events');
const _ = require('lodash');
const { parse } = require('shell-quote');
const { browser, firebase } = require('./data');
const { npm } = require('./packages');

const setImmediate = (fn) => setTimeout(fn, 0);

const defaultValues = {
    runtime: 'CucumberJS 8.x',
    dialect: 'en',
    language: 'javascript',
};

const cache = {
    ...defaultValues,
    isTestingEnabled: true,
    isTestRunning: false,
};

const app = {
    logger: new Logger(),
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
    } else {
        hub.emit('signedOut');
    }
});

app.signIn = () => firebase.signIn()
    .then((user) => hub.emit('signedIn', user));

app.signOut = () => {
    firebase.signOut();
    hub.emit('signedOut');
};

const getOwner = () => cache.owner;
const setOwner = (owner) => {
    cache.owner = owner;
    hub.emit('ownerChanged', owner);
};

app.getStepSource = () => languages[app.getLanguage()].stepSource;

app.tidySource = (source) => languages[app.getLanguage()].tidy(source);

// Persistence

function loadJam() {
    const id = browser.page();
    if (!id) {
        console.log('Initiating new jam...');
        return Promise.all([
            Promise.resolve(setOwner(null)),
            Promise.resolve(app.setName('New Jam')),
            app.setFeature({ id: 1, name: 'test.feature', source: featureSource }),
            app.setStepDefinition({ id: 1, name: 'steps.js', source: app.getStepSource() }),
        ]);
    }
    console.log(`Loading existing jam ${id}...`);
    return firebase.getJam(id)
        .then((jam) => app.setLanguage(jam.language || defaultValues.language).then(() => jam))
        .then((jam) => Promise.all([
            Promise.resolve(setOwner({
                uid: jam.uid, name: jam.createdBy.name, photo: jam.createdBy.photo,
            })),
            Promise.resolve(app.setName(jam.name)),
            Promise.resolve(app.setFork(jam.fork)),
            app.setRuntime(jam.runtime || defaultValues.runtime),
            app.setDialect(jam.dialect || defaultValues.dialect),
            ...(jam.features.map((i) => app.setFeature(i))),
            ...(jam.stepDefinitions.map((i) => app.setStepDefinition(i))),
        ]));
}

app.save = () => Promise.resolve(hub.emit('saving'))
    .then(() => firebase.saveJam(browser.page(), {
        name: app.getName(),
        runtime: app.getRuntime(),
        language: app.getLanguage(),
        dialect: app.getDialect(),
        features: app.getFeatures(),
        stepDefinitions: app.getStepDefinitions(),
    })).then((id) => {
        hub.emit('saved', id);
        if (id) {
            browser.page(id);
            return loadJam();
        }
        return undefined;
    });

app.fork = () => Promise.resolve(hub.emit('forking'))
    .then(() => firebase.forkJam(browser.page(), {
        name: app.getName(),
        runtime: app.getRuntime(),
        language: app.getLanguage(),
        dialect: app.getDialect(),
        features: app.getFeatures(),
        stepDefinitions: app.getStepDefinitions(),
        createdBy: getOwner(),
    })).then((id) => {
        hub.emit('forked', id);
        browser.page(id);
        return loadJam();
    });

app.getMyJams = () => {
    if (!cache.myJams) {
        return firebase.getMyJams(cache.after)
            .then((jams) => {
                cache.myJams = jams.map((jam) => ({
                    ...jam,
                    // eslint-disable-next-line no-underscore-dangle
                    dateUpdated: new Date(jam.dateUpdated._seconds * 1000),
                }));
                hub.emit('myJamsLoaded', cache.myJams);
                return cache.myJams;
            });
    }
    hub.emit('myJamsLoaded', cache.myJams);
    return Promise.resolve(cache.myJams);
};

app.setJamsAfter = (after) => {
    cache.after = after;
    cache.myJams = undefined;
    hub.emit('jamsAfterChanged', after);
};

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
};

/**
 * @private
 */
const disableTests = () => {
    cache.isTestingEnabled = false;
    hub.emit('testsDisabled');
};

/**
 * @private
 */
const startTests = () => {
    cache.isTestRunning = true;
    hub.emit('testsStarted');
};

/**
 * @private
 */
const endTests = (err) => {
    cache.isTestRunning = false;
    hub.emit('testsEnded', err);
};

/**
 * @private
 */
function runTestsInternal(tags) {
    try {
        startTests();
        const packages = {};
        const { loadRuntime, executeRuntime } = runtimes[app.getLanguage()];

        app.getPackages().then((pkgData) => {
            pkgData.forEach((pkg) => {
                packages[pkg.name] = browser.global(_.camelCase(pkg.name));
            });
        })
            .then(() => loadRuntime(app.getRuntime()))
            .then(() => executeRuntime(app.getRuntime(), {
                features: app.getFeatures(),
                stepDefinitions: app.getStepDefinitions(),
                language: app.getLanguage(),
                dialect: app.getDialect(),
                packages,
                logger: app.logger,
                tags,
            }))
            .then((success) => {
                app.logger.log(`\nProcess exited with status code ${success ? 0 : 1}.\n\n`);
                endTests(!success);
            })
            .catch((err) => {
                app.logger.error(errorFormatter(err));
                endTests(err);
            });
    } catch (err) {
        app.logger.error(errorFormatter(err));
        endTests(err);
    }
}

let testWaitFlag = false;

app.run = (tags) => {
    if (cache.isTestingEnabled && !cache.isTestRunning) {
        return runTestsInternal(tags);
    }
    if (!testWaitFlag) {
        testWaitFlag = true;
        return new Promise((resolve) => {
            hub.once(!cache.isTestingEnabled ? 'testsEnabled' : 'testsEnded', () => {
                testWaitFlag = false;
                resolve(runTestsInternal(tags));
            });
        });
    }
    return undefined;
};
app.cucumber = app.run;

// Favorites

app.like = () => Promise.resolve(hub.emit('changingLike'))
    .then(() => firebase.likeJam(browser.page()))
    .then(() => Promise.resolve(hub.emit('liked')));

app.unlike = () => Promise.resolve(hub.emit('changingLike'))
    .then(() => firebase.unlikeJam(browser.page()))
    .then(() => Promise.resolve(hub.emit('unliked')));

// Dialect Management

app.getDialects = () => _.sortBy(_.keys(dialects).map((key) => ({
    value: key,
    label: dialects[key].native,
})), (i) => i.label);
app.getDialect = () => cache.dialect;
app.setDialect = (d) => {
    cache.dialect = d;
    hub.emit('dialectChanged', d);
};

// Language Management

app.getLanguages = () => _.values(languages);
app.getLanguage = () => cache.language;
app.setLanguage = (lang) => {
    cache.language = lang;
    hub.emit('languageChanged', lang);
    return app.setRuntime(app.getRuntimes()[0].value);
};

// Runtime Management

app.getRuntimes = (lang) => runtimes[lang || app.getLanguage()].getRuntimes();
app.getRuntime = () => cache.runtime;
app.setRuntime = (r) => {
    if (cache.runtime !== r) {
        cache.runtime = r;
        disableTests();
        return runtimes[app.getLanguage()].loadRuntime(r)
            .then(() => {
                enableTests();
                hub.emit('runtimeChanged', r);
                console.log(`Runtime changed to ${r}`);
            });
    }
    return Promise.resolve();
};

// Package Management

app.getPackages = () => {
    disableTests();
    return npm.getPackages()
        .then((result) => {
            enableTests();
            return result;
        });
};

app.addPackage = (name, version) => {
    disableTests();
    return npm.addPackage(name, version)
        .then((result) => {
            enableTests();
            return result;
        });
};

app.removePackage = (name) => npm.removePackage(name);

// Feature Files

app.getFeatures = () => cache.features || [];
app.setFeature = ({ id, name, source }) => {
    cache.features = cache.features || [];
    const selected = cache.features.filter((i) => i.id === id)[0];
    if (selected) {
        selected.name = name;
        selected.source = source;
    } else {
        cache.features.push({ id, name, source });
    }

    hub.emit('featureUpdated', { id, name, source });
    return Promise.resolve();
};

// Step Definitions

app.getStepDefinitions = () => cache.steps || [];
app.setStepDefinition = ({ id, name, source }) => {
    cache.steps = cache.steps || [];
    const selected = cache.steps.filter((i) => i.id === id)[0];
    if (selected) {
        selected.name = name;
        selected.source = source;
    } else {
        cache.steps.push({ id, name, source });
    }
    return npm.scanForPackages(source)
        .then(() => hub.emit('stepDefinitionUpdated', { id, name, source }))
        .then(() => enableTests(), (err) => {
            disableTests();
            throw err;
        });
};

app.execute = (text) => {
    const { logger } = app;
    const [cmdKebab, ...args] = parse(text || '');
    const command = _.camelCase(cmdKebab);

    const processCommandOutput = (output) => {
        if (_.isArray(output) && output.length > 0 && output[0].label && output[0].value) {
            return output.map((i) => `${i.label} (${i.value})`).join('\n') + '\n';
        }
        if (_.isArray(output) && output.length > 0 && output[0].name && output[0].version) {
            return output.map((i) => `${i.name}@${i.version}`).join('\n') + '\n';
        }
        if (output) {
            return output + '\n';
        }
        return undefined;
    };

    logger.log(`$ ${text}\n`);
    if (app[command] && _.isFunction(app[command])) {
        try {
            const result = app[command](...args);
            if (result && result.then) {
                result.then((r) => logger.log(processCommandOutput(r)));
            } else {
                logger.log(processCommandOutput(result));
            }
        } catch (err) {
            logger.log(`${err.name}: ${err.message}\n`);
        }
    } else {
        logger.log(`CommandError: command '${command}' not found.\n`);
    }
};

app.on = hub.on.bind(hub);

app.handleEnter = (fn) => (e) => {
    if (e.key === 'Enter') {
        return fn();
    }
    return undefined;
};

export default app;

console.log('testjam.io app start.');
setTimeout(() => {
    const theme = browser.local('theme') ? browser.local('theme') : app.getThemes()[0];
    loadJam()
        .then(() => app.setTheme(theme))
        .then(() => browser.enableApp())
        .then(() => setTimeout(() => {
            // after the page loads, start running tests.
            if (browser.page()) {
                app.run();
            }
        }, 0))
        .catch((err) => {
            document.getElementById('loadingIcon').className = 'fa fa-warning';
            document.getElementById('loadingMessage').innerHTML = `${err.name}: ${err.message}`;
        });
}, 800);
