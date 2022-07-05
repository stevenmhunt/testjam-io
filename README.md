# testjam.io
An online coding environment specifically designed for Cucumber and Gherkin.

[![Deploy to Firebase Hosting on merge](https://github.com/stevenmhunt/testjam-io/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/stevenmhunt/testjam-io/actions/workflows/firebase-hosting-merge.yml)
[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)


## About

When I first started building this project, I realized that most major programming languages and frameworks have some sort of online sandbox environment for sharing code examples, but Cucumber did not. As BDD gets more popular in the modern QA toolkit, the need to quickly share and experiment with testing tools over the Internet will increase.

### Project Goals
- Deliver an easy-to-use web-based tool for creating and sharing feature files and their accompanying step definitions.
- Improve the quality of online documentation and Q&A responses regarding Cucumber and Gherkin.
- Provide a useful service to the wider QA automation community.
- *Personal Goal:* Avoid boredom during the COVID-19 quarantine by developing and launching a new web-based software tool.

## Getting Started

### Prerequisites
- NodeJS/NPM
- Git
- Bash
- Make
- A firebase instance (or the local emulator with functions and firestore support configured)

### Installation
```bash
npm install
make

# assuming you have a firebase environment configured....
npm start
```

Once your environment is configured, you can use `npm run watch` to automatically re-compile Sass and JSX changes.

## Future Improvements
- Support for multiple written langauges (Spanish, French, Italian, etc.)
- Support for multiple programming languages (CucumberJVM and Cucumber.rb hopefully)
- `require()` support for scoped packages (@scope/package) via upgrades to Browserify CDN.
- More official support for Cucumber.js browser-compatible builds for 7.x and 8.x versions.