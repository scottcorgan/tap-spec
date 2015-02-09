# tap-spec
 
Formatted TAP output like Mocha's spec reporter

![screen shot 2015-02-06 at 10 04 49 am](https://cloud.githubusercontent.com/assets/974723/6084649/9b25097e-ade7-11e4-85ad-b9b765cf3af0.png)
 
## Install
 
```
npm install tap-spec --save-dev
```

## Usage

### Streaming

```js
var test = require('tape');
var tapSpec = require('tap-spec');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);
```

### CLI

**package.json**

```json
{
  "name": "module-name",
  "scripts": {
    "test": "node ./test/tap-test.js | tap-spec"
  }
}
```

Then run with `npm test`
 
**Terminal**

```
tape test/index.js | node_modules/.bin/tap-spec
``` 

**Testling**

```
npm install testling -g
testling test/index.js | node_modules/.bin/tap-spec
```
