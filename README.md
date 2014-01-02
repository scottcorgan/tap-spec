# tap-spec
 
Formatted TAP output like Mocha's spec reporter
 
## Install
 
```
npm install tap-spec --save-dev
```
 
## Usage
 
**Terminal**

```
tape test/index.js | node_modules/.bin/tspec
``` 

**Testling**

```
npm install testling -g
testling test/index.js | node_modules/.bin/tspec
```