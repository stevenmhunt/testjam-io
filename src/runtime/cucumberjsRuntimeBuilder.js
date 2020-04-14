const _ = require('lodash');
const regeneratorRuntime = require('regenerator-runtime');
const EventEmitter = require('events');
const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../utils/scripts');

const stepDefinitionFormatter = require('../formatters/stepDefinitionFormatter');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function cucumberRuntimeBuilder(version) {
    const [major] = version.split('.');
    const libname = `__cucumber${major}`;

    function load() {
        return loadStackChain(`cucumber${major}x_preload`, '2.0.0')
            .then(() => executeScriptUrl(`cucumber${major}x`, `/js/runtimes/cucumberjs-${major}.x.min.js`))
            .then(result => waitUntilExists(libname, result));
    }

    function execute({ features, stepDefinitions, packages, logger }) {
        const cucumber = window[libname];
        if (!cucumber) {
            logger.error(`Expected CucumberJS ${major}.x script files to be loaded. Exiting...`);
            return Promise.resolve();
        }

        logger.info(`Starting CucumberJS ${version}...\n`);
        const dependencies = Object.assign({}, packages, { cucumber });

        function _runFeature() {
            _runFeature = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee() {
                    const eventBroadcaster = new EventEmitter();
                    const eventDataCollector = new cucumber.formatterHelpers.EventDataCollector(eventBroadcaster);
                    var testCases, supportCodeLibrary, formatterOptions, runtime;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    testCases = Promise.all(features.map(({ name, source }) =>
                                        cucumber.getTestCases({
                                            eventBroadcaster,
                                            pickleFilter: new cucumber.PickleFilter({}),
                                            source,
                                            uri: `/${name}`
                                        }))).then(i => _.flatten(i));
                                    cucumber.supportCodeLibraryBuilder.reset('');
                                    stepDefinitions
                                        .map(stepDefinitionFormatter)
                                        .forEach(i => new Function('__dependencies', i)(dependencies)); // eslint-disable-line no-new-func
                                    _context.next = 10;
                                    return cucumber.supportCodeLibraryBuilder.finalize();

                                case 10:
                                    supportCodeLibrary = _context.sent;
                                    formatterOptions = {
                                        colorsEnabled: true,
                                        cwd: '/',
                                        eventBroadcaster,
                                        eventDataCollector,
                                        log: i => logger.log(i),
                                        supportCodeLibrary
                                    };
                                    cucumber.FormatterBuilder.build('progress', formatterOptions);
                                    runtime = new cucumber.Runtime({
                                        eventBroadcaster: eventBroadcaster,
                                        options: {},
                                        testCases,
                                        supportCodeLibrary
                                    });
                                    return _context.abrupt("return", runtime.start());

                                case 15:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee);
                }));
            return _runFeature.apply(this, arguments);
        }

        return _runFeature.apply(this, arguments);
    };

    return { execute, load };
}

module.exports = cucumberRuntimeBuilder;
