const ws = require('ws');
const tg = require('./transactionGenerator');
module.exports = class wsServer {
    constructor(port) {
        this.wss = new ws.WebSocketServer({
            port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                concurrencyLimit: 10,
                threshold: 1024
            }
        })

        this.clients = new Map();

        this.wss.on('listening', () => {
            console.log(`Started gateway on port ${port}`);
        })

        this.wss.on('connection', (s) => {
            if (this.clients.size != 0) {
                let keys = [];
                this.clients.keys(k => keys.push(parseInt(k, 10)));
                let maxId = Math.max(keys)
                for (let i = 0; i < maxId; i++) {
                    if (!keys.includes(i)) {
                        s.id = i;
                        return;
                    }
                }
                if(!s.id){
                    s.id = this.clients.size;
                }
            } else {
                s.id = 0;
            }
            this.clients.set(s.id, s)
            console.log(`New client ID: ${s.id}`)
            s.on('close', () => {
                this.clients.delete(s.id);
                console.log(`Client disconnected ID: ${s.id}`);
            })
        })
    }

    route(d) {
        d.transactionId = tg();
        if(this.clients.size == 0) return console.log(`No available containers`);
        var client_id;
        if(d.d.guild_id){
            client_id = Math.abs((parseInt(d.d.guild_id, 10) >> 22) % this.clients.size);
        }else{
            client_id = Math.floor(Math.random() * this.clients.keys.length);
        }
        if(!this.clients.has(client_id)) {
            console.log(`No available container for this request, rourouting`);
            client_id = Math.floor(Math.random() * this.clients.keys.length);
        }
        const client = this.clients.get(client_id);
        console.log(`Routing request: client_id: ${client_id} shard_id: ${d.sid} transaction: ${d.transactionId}`)
        client.send(JSON.stringify(d));
    }
}

process.on('uncaughtException', console.log)
process.on('unhandledRejection', console.log)