require('dotenv').config();
const config = require('../config.json');
const shardManager = require('./util/shardManager');
const sm = new shardManager(config.shards, 100, config.port, process.env.TOKEN)
sm.start();