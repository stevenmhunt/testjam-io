const _ = require('lodash');
const { waitUntilExists, executeScriptUrl } = require('../utils/scripts');
const cachedPackages = require('../../config/packages.json');

const cache = {
    packages: [],
    downloadedPackages: [],
};

function isDownloaded(name) {
    return cache.downloadedPackages.indexOf(name) >= 0;
}

function removePackage(name) {
    cache.packages = cache.packages
        .filter((i) => i.name !== name);
    return Promise.resolve();
}

function generateScriptTag(name, version) {
    if (cachedPackages[name]) {
        return executeScriptUrl(`script_${name}`, `https://storage.testjam.io/packages/${cachedPackages[name]}.js`);
    }
    return executeScriptUrl(`script_${name}`, `https://cdn.testjam.io/standalone/${name}@${version}`);
}

function downloadPackage(name, version = 'latest') {
    if (!isDownloaded(name)) {
        return generateScriptTag(name, version)
            .then((r) => waitUntilExists(_.camelCase(name), r))
            .catch((err) => {
                removePackage(name);
                throw err;
            });
    }
    return Promise.resolve();
}

function syncPackages() {
    return Promise.all(cache.packages
        .filter((i) => !isDownloaded(i.name))
        .map((i) => downloadPackage(i.name, i.version)));
}

function getPackages() {
    return syncPackages()
        .then(() => cache.packages);
}

function addPackage(name, version = 'latest') {
    cache.packages.push({ name, version });
    return syncPackages();
}

function scanForPackages(source) {
    if (!source) {
        return Promise.resolve();
    }

    const requires = (source.match(/require\s*\(['"](.*)['"]\)/g) || [])
        .map((i) => i.match(/require\s*\(['"](.*)['"]\)/)[1]);

    return getPackages()
        .then((packages) => packages.map((i) => i.name))
        .then((packages) => requires.filter((i) => packages.indexOf(i) === -1 && i !== 'cucumber' && i !== '@cucumber/cucumber'))
        .then((newPackages) => Promise.all(newPackages.map((i) => addPackage(i))));
}

module.exports = {
    getPackages,
    addPackage,
    removePackage,
    scanForPackages,
};
