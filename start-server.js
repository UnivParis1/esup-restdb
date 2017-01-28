#!/usr/bin/env node

"use strict";

if (!process.env.NODE_ENV) {
   process.env.NODE_ENV = 'production';
}

let express = require('express')
let api_init = require('./api/init');


let app = express();

api_init(app);

let port = process.env.PORT || 8080;
app.listen(port);
console.log('Started on port ' + port);
