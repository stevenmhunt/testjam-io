import _ from 'lodash';

const labels = {
    'Cucumber.rb 8.0.0': 'CucumberRuby 8.x',
    'Cucumber.rb 7.1.0': 'CucumberRuby 7.x',
    'Cucumber.rb 6.1.0': 'CucumberRuby 6.x',
    'Cucumber.rb 5.3.0': 'CucumberRuby 5.x',
    'Cucumber.rb 4.1.0': 'CucumberRuby 4.x',
    'Cucumber.rb 3.2.0': 'CucumberRuby 3.x',
    'Cucumber.rb 2.99.0': 'CucumberRuby 2.x',
    'Cucumber.rb 1.3.20': 'CucumberRuby 1.x',
};

function getRuntimes() {
    return _.keys(labels).map((key) => ({
        label: key,
        value: labels[key],
    }));
}

function executeRuntime(version, options) {
    const { logger } = options;
    logger.info(`Running ${version}...`);
    return Promise.resolve(true);
}

function loadRuntime() {
    return Promise.resolve();
}

export {
    getRuntimes,
    executeRuntime,
    loadRuntime,
};
