# tap-spec
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/scottcorgan/tap-spec?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
 
Formatted TAP output like Mocha's spec reporter

![screen shot 2014-11-20 at 4 11 03 pm](https://cloud.githubusercontent.com/assets/974723/5135660/d83bb344-70cf-11e4-98c1-cca14d76d5a7.png)
 
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
