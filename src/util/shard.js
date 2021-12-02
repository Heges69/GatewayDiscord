const Quartz = require('@botsocket/quartz');
const { EventEmitter } = require('events');


module.exports = class Shard extends EventEmitter{
    constructor(token, shardId, shardMax){
        super();
        let quartz = new Quartz.client('wss://gateway.discord.gg', {
            token,
            shard: [shardId, shardMax]
        })

        quartz.connect();

        quartz.onDispatch = (evt, data) => {
            this.emit('data', {e: evt, d: data, sid: shardId})
        }
    }

        
}