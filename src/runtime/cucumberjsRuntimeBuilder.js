const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../utils/scripts');

const stepDefinitionFormatter = require('../formatters/stepDefinitionFormatter');

function cucumberRuntimeBuilder(version) {
    const [major] = version.split('.');
    const libname = `__cucumber${major}`;

    function load() {
        return loadStackChain(`cucumber${major}x_preload`, '2.0.0')
            .then(() => executeScriptUrl(`cucumber${major}x`, `/js/runtimes/cucumberjs-${major}.x.js?r=1`))
            .then((result) => waitUntilExists(libname, result));
    }

    async function execute({
        features, stepDefinitions, packages, logger, language,
    }) {
        const cucumber = window[libname];
        if (!cucumber) {
            logger.error(`Expected CucumberJS ${major}.x script files to be loaded. Exiting...`);
            return Promise.resolve();
        }

        logger.info(`Starting CucumberJS ${version}...\n`);
        const supportCodeLibrary = cucumber.buildSupportCodeLibrary((cuke) => {
            const dependencies = { ...packages, cucumber: cuke, '@cucumber/cucumber': cuke };
            stepDefinitions
                .map(stepDefinitionFormatter)
                // eslint-disable-next-line no-new-func
                .forEach((i) => new Function('__dependencies', i)(dependencies));
        });

        await cucumber.executeTests({
            parsedArgvOptions: {
                colorsEnabled: true,
            },
            language,
            runtimeOptions: {},
            supportCodeLibrary,
            sources: features.map((i) => ({ data: i.source || '', uri: i.name || '' })),
            type: 'progress',
            logFn: (i) => logger.log(i),
        });

        return true;
    }

    return { execute, load };
}

module.exports = cucumberRuntimeBuilder;
