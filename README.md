# tap-spec
 
Formatted TAP output like Mocha's spec reporter

![Output screenshot](http://i.imgur.com/3yh5prr.png)
 
## Install
 
```
npm install tap-spec --save-dev
```
 
## Usage

**packge.json**

```json
{
  "name": "module-name",
  "scripts": {
    "test": "node ./test/tap-test.js | node_modules/.bin/tspec"
  }
}
```

Then run with `npm test`
 
**Terminal**

```
tape test/index.js | node_modules/.bin/tspec
``` 

**Testling**

```
npm install testling -g
testling test/index.js | node_modules/.bin/tspec
```
