const fs = require('fs');
const path = './angular.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

if (!data.projects['angular-campconnect'].architect.test) {
  data.projects['angular-campconnect'].architect.test = {
    "builder": "@angular-devkit/build-angular:karma",
    "options": {
      "polyfills": ["zone.js", "zone.js/testing"],
      "tsConfig": "tsconfig.spec.json",
      "inlineStyleLanguage": "css",
      "assets": [
        { "glob": "**/*", "input": "public" },
        "src/assets"
      ],
      "styles": ["src/styles/globals.css"],
      "scripts": [],
      "karmaConfig": "karma.conf.js"
    }
  };
}

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log("Updated angular.json with test target.");
