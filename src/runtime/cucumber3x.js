const _ = require('lodash');
const regeneratorRuntime = require('regenerator-runtime');
const chai = require('chai');
const EventEmitter = require('events');

const stepDefinitionProcessor = require('../stepDefinitionProcessor');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

module.exports = function runCucumber3x({ features, stepDefinitions, modules, logger }) {
    const cucumber = window.cucumber3;
    const dependencies = {
        cucumber,
        chai
    };
    if (!cucumber) {
        logger.error('Expected CucumberJS 3 script files to be loaded. Exiting...');
        return Promise.resolve();
    }
    logger.info(`Starting CucumberJS 3.2.1...\n`);
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
                                    .map(stepDefinitionProcessor)
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
