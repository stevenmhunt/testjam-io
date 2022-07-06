import _ from 'lodash';

const labels = {
    'Cucumber-JVM 7.4.1': 'CucumberJVM 7.x',
    'Cucumber-JVM 6.11.0': 'CucumberJVM 6.x',
    'Cucumber-JVM 5.6.0': 'CucumberJVM 5.x',
    'Cucumber-JVM 4.8.1': 'CucumberJVM 4.x',
    'Cucumber-JVM 3.0.2': 'CucumberJVM 3.x',
    'Cucumber-JVM 2.4.0': 'CucumberJVM 2.x',
    'Cucumber-JVM 1.2.6': 'CucumberJVM 1.x',
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
