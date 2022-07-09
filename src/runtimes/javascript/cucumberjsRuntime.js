const { version: testjamVersion } = require('../../../package.json');
const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../../utils/scripts');

const stepDefinitionFormatter = require('../../formatters/stepDefinitionFormatter');

function cucumberRuntimeBuilder(version) {
    const [major] = version.split('.');
    const libname = `__cucumber${major}`;

    function load() {
        return loadStackChain(`cucumber${major}x_preload`, '2.0.0')
            .then(() => executeScriptUrl(`cucumber${major}x`, `/js/runtimes/cucumberjs-${major}.x.js?r=${testjamVersion}`))
            .then((result) => waitUntilExists(libname, result));
    }

    async function execute({
        features, stepDefinitions, packages, logger, dialect, tags,
    }) {
        const cucumber = window[libname];
        if (!cucumber) {
            logger.error(`Expected Cucumber.js ${major}.x script files to be loaded. Exiting...`);
            return Promise.resolve();
        }

        logger.info(`Starting Cucumber.js ${version}...\n`);
        const supportCodeLibrary = cucumber.buildSupportCodeLibrary((cuke) => {
            const dependencies = { ...packages, cucumber: cuke, '@cucumber/cucumber': cuke };
            stepDefinitions
                .map(stepDefinitionFormatter)
                // eslint-disable-next-line no-new-func
                .forEach((i) => new Function('__dependencies', 'console', i)(dependencies, logger));
        });

        let pickleFilter;
        if (tags) {
            pickleFilter = (pickle) => pickle.tags.map((i) => i.name).indexOf(tags) >= 0;
        }

        return cucumber.executeTests({
            parsedArgvOptions: {
                colorsEnabled: true,
            },
            dialect,
            runtimeOptions: {
                filterStacktraces: true,
                tags,
            },
            supportCodeLibrary,
            sources: features.map((i) => ({ data: i.source || '', uri: i.name || '' })),
            pickleFilter,
            type: 'progress',
            logFn: (i) => logger.info(i),
        });
    }

    return { execute, load };
}

module.exports = cucumberRuntimeBuilder;
