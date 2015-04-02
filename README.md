# tap-spec
 
Formatted TAP output like Mocha's spec reporter

![screen shot 2015-04-02 at 9 30 26 am](https://cloud.githubusercontent.com/assets/974723/6968348/e92bb736-d91a-11e4-9946-6cf59659a6b2.png)
 
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
