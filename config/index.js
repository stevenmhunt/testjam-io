// configuration for testjam.io

module.exports = {
  runtimes: require('./runtimes.json'),
  themes: require('./themes.json'),
  firebase: require('./firebase.json'),
  strings: require('./lang/en-US.json'),
  featureSource: '# Welcome to gherkin! Add features and scenarios here.',
  stepSource: '// Welcome! You can require packages at the top of your code just like in NodeJS.'
};