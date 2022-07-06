/* eslint-disable no-param-reassign */
/* eslint-disable default-case */
/* eslint-disable no-underscore-dangle */
const _ = require('lodash');
const regeneratorRuntime = require('regenerator-runtime');
const EventEmitter = require('events');
const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../utils/scripts');

const stepDefinitionFormatter = require('../formatters/stepDefinitionFormatter');

/**
 * Note: this function came from a third-party source.
 */
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        // eslint-disable-next-line vars-on-top, no-var
        var info = gen[key](arg);
        // eslint-disable-next-line vars-on-top, no-var
        var { value } = info;
    } catch (error) {
        reject(error);
        return;
    }
    // eslint-disable-next-line block-scoped-var
    if (info.done) {
        // eslint-disable-next-line block-scoped-var
        resolve(value);
    } else {
        // eslint-disable-next-line block-scoped-var
        Promise.resolve(value).then(_next, _throw);
    }
}

/**
 * Note: this function came from a third-party source.
 */
function _asyncToGenerator(fn) {
    // eslint-disable-next-line func-names
    return function () {
        const self = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        return new Promise((resolve, reject) => {
            const gen = fn.apply(self, args);
            // eslint-disable-next-line
            function _next(value) {
                // eslint-disable-next-line no-use-before-define
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
            }
            // eslint-disable-next-line
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
            }
            _next(undefined);
        });
    };
}

function cucumberRuntimeBuilder(version) {
    const [major] = version.split('.');
    const libname = `__cucumber${major}`;

    function load() {
        return loadStackChain(`cucumber${major}x_preload`, '2.0.0')
            .then(() => executeScriptUrl(`cucumber${major}x`, `/js/runtimes/cucumberjs-${major}.x.min.js?r=1`))
            .then((result) => waitUntilExists(libname, result));
    }

    function execute({
        features, stepDefinitions, packages, logger, dialect,
    }) {
        const cucumber = window[libname];
        if (!cucumber) {
            logger.error(`Expected CucumberJS ${major}.x script files to be loaded. Exiting...`);
            return Promise.resolve();
        }

        logger.info(`Starting CucumberJS ${version}...\n`);
        const dependencies = { ...packages, cucumber };

        function _runFeature() {
            // eslint-disable-next-line no-func-assign
            _runFeature = _asyncToGenerator(
                /* #__PURE__ */
                regeneratorRuntime.mark(function _callee() {
                    const eventBroadcaster = new EventEmitter();
                    const eventDataCollector = new cucumber.formatterHelpers.EventDataCollector(
                        eventBroadcaster,
                    );
                    let testCases; let supportCodeLibrary; let formatterOptions; let
                        runtime;
                    return regeneratorRuntime.wrap((_context) => {
                        // eslint-disable-next-line no-constant-condition
                        while (1) {
                            switch (_context.prev = _context.next) {
                            case 0:
                                testCases = Promise.all(
                                    features.map(({ name, source }) => cucumber.getTestCases({
                                        eventBroadcaster,
                                        pickleFilter: new cucumber.PickleFilter({}),
                                        source,
                                        language: dialect,
                                        uri: `/${name}`,
                                    })),
                                ).then((i) => _.flatten(i));
                                cucumber.supportCodeLibraryBuilder.reset('');
                                stepDefinitions
                                    .map(stepDefinitionFormatter)
                                    .forEach((i) => new Function('__dependencies', i)(dependencies)); // eslint-disable-line no-new-func
                                _context.next = 10;
                                return cucumber.supportCodeLibraryBuilder.finalize();

                            case 10:
                                supportCodeLibrary = _context.sent;
                                formatterOptions = {
                                    colorsEnabled: true,
                                    cwd: '/',
                                    eventBroadcaster,
                                    eventDataCollector,
                                    log: (i) => logger.log(i),
                                    supportCodeLibrary,
                                };
                                cucumber.FormatterBuilder.build('progress', formatterOptions);
                                runtime = new cucumber.Runtime({
                                    eventBroadcaster,
                                    options: {},
                                    testCases,
                                    supportCodeLibrary,
                                });
                                return _context.abrupt('return', runtime.start());

                            case 15:
                            case 'end':
                                return _context.stop();
                            }
                        }
                    }, _callee);
                }),
            );
            // eslint-disable-next-line prefer-rest-params
            return _runFeature.apply(this, arguments);
        }

        // eslint-disable-next-line prefer-rest-params
        return _runFeature.apply(this, arguments);
    }

    return { execute, load };
}

module.exports = cucumberRuntimeBuilder;
