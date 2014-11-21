# tap-spec
 
Formatted TAP output like Mocha's spec reporter

![tap-spec preview](https://cloud.githubusercontent.com/assets/974723/5135637/91582926-70cf-11e4-8daf-1599ff89969b.png)
 
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

**packge.json**

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
