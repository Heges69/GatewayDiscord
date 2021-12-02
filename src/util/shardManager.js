const Shard = require('./shard');
const WsServer = require('./wsServer');

module.exports = class shardManager{

    /**
     * 
     * @param {Number} shardCount How many shards do you want to spawn 
     * @param {*} shardSpawnSpeed How fast do you want to spawn shards (miliseconds)
     * @param {*} port Port for websocket server
     */
    constructor(shardCount, shardSpawnSpeed, port, token){
        this.shardCount = shardCount;
        this.shardSpawnSpeed = shardSpawnSpeed;
        this.port = port;
        this.token = token;
        this.shards = [];
        this.wsServer = new WsServer(port);
    }

    start(){
        let s = 0;
        let interval = setInterval(() => {
            let shard = new Shard(this.token, s, this.shardCount);
            shard.on('data', d => {
                this.data(d);
            })
            console.log(`Started a new shard [ ${s}, ${this.shardCount} ]`)
            if(s == this.shardCount-1) return clearInterval(interval);
            s++;
        }, this.shardSpawnSpeed)
    }


    data(d){
        this.wsServer.route(d);
    }
}