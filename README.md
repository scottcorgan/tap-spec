# tap-spec
 
Formatted TAP output like Mocha's spec reporter

![screen shot 2014-11-20 at 3 32 32 pm](https://cloud.githubusercontent.com/assets/974723/5135186/a7d15ff6-70ca-11e4-9526-e1e5cbaa0f4b.png)
 
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
