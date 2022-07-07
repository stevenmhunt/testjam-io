import _ from 'lodash';

const labels = {
    'CucumberJVM 7.x': 'Cucumber-JVM 7.4.1',
    'CucumberJVM 6.x': 'Cucumber-JVM 6.11.0',
    'CucumberJVM 5.x': 'Cucumber-JVM 5.6.0',
    'CucumberJVM 4.x': 'Cucumber-JVM 4.8.1',
    'CucumberJVM 3.x': 'Cucumber-JVM 3.0.2',
    'CucumberJVM 2.x': 'Cucumber-JVM 2.4.0',
    'CucumberJVM 1.x': 'Cucumber-JVM 1.2.6',
};

function getRuntimes() {
    return _.keys(labels).map((key) => ({
        value: key,
        label: labels[key],
    }));
}

function executeRuntime(version, options) {
    const { logger } = options;
    logger.info(`Running ${labels[version]}...`);
    logger.info('\n\n*** SUPPORT FOR RUNNING JAVA AND RUBY IS STILL IN DEVELOPMENT ***\n');
    return Promise.resolve(false);
}

function loadRuntime() {
    return Promise.resolve();
}

export {
    getRuntimes,
    executeRuntime,
    loadRuntime,
};
