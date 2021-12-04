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

        this.clients = [];

        this.wss.on('listening', () => {
            console.log(`Started gateway on port ${port}`);
        })

        this.wss.on('error', console.log)

        this.wss.on('connection', async (s) => {
            s.ident = await tg()
            this.clients.push(s)
            s.id = this.clients.length-1
            console.log(`New client ID: ${s.id}`)
            s.on('close', () => {
                this.clients = this.clients.filter(f => f.ident == s.ident)
                console.log(`Client disconnected ID: ${s.id}`);
            })
        })
    }

    route(d) {
        d.transactionId = tg();
        if(this.clients.length == 0) return console.log(`No available containers`);
        var client_id;
        if(d.d.guild_id){
            client_id = Math.abs((parseInt(d.d.guild_id, 10) >> 22) % this.clients.length);
        }else{
            client_id = Math.floor(Math.random() * this.clients.keys.length);
        }
        if(!this.clients[client_id]) {
            console.log(`No available container for this request, rourouting`);
            client_id = Math.floor(Math.random() * this.clients.length);
        }
        const client = this.clients[client_id]
        if(!client) return;
        console.log(`Routing request: client_id: ${client_id} shard_id: ${d.sid} transaction: ${d.transactionId}`)
        client.send(JSON.stringify(d));
    }
}

process.on('uncaughtException', console.log)
process.on('unhandledRejection', console.log)