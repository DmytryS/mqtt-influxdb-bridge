require('babel-register')({
    retainLines: true
});

const bridge = require('./app.js');

bridge.default.start();
