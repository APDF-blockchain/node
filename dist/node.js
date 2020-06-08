"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const p2p_1 = require("./p2p");
const httpserver_1 = require("./httpserver");
const blockchain_1 = require("./blockchain");
const config_1 = require("./config");
/**
 * @classdesc - This class is the main of the entire blockchain.  Many of these can be run as peers.
 * @class Node
 */
class Node {
    /**
     * @description - This constructor sets up the http and p2p servers and listens on their respective ports
     * @constructor
     */
    constructor(args) {
        /**
         * @description - configuration object
         */
        this.config = new config_1.Config();
        /**
         * @description - http port for the http server
         */
        this.httpPort = parseInt(process.env.PORT) || this.config.defaultServerPort;
        /**
         * @description - p2p port number for the p2p server
         */
        this.p2pPort = this.config.defaultP2pPort;
        /**
         * @description - comma separated list of peer urls.
         */
        this.initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];
        // let peer: string = args.peer;
        // let peer: string = "http://localhost:6002";
        // if (peer !== null) {
        //     this.initialPeers.push(peer);
        // }
        //console.log(this.initialPeers);
        this.blockchain = new blockchain_1.BlockChain();
        /**
         * The blockchain and the p2p call into each other.
         */
        this.p2p = new p2p_1.P2P(this.blockchain);
        this.blockchain.setP2PService(this.p2p);
        /**
         * The http server talks to both the blockchain and the p2p
         */
        this.httpServer = new httpserver_1.HttpServer(this.blockchain, this.p2p);
        //this.p2p.connectToPeers(this.initialPeers);
        this.httpServer.initHttpServer(this.httpPort);
        this.p2p.initP2PServer(this.p2pPort);
        this.p2p.connectToPeers(this.initialPeers);
    }
}
exports.Node = Node;
function getArgs() {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
        // long arg
        if (arg.slice(0, 2) === '--') {
            const longArg = arg.split('=');
            const longArgFlag = longArg[0].slice(2, longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === '-') {
            const flags = arg.slice(1, arg.length).split('');
            flags.forEach(flag => {
                args[flag] = true;
            });
        }
    });
    return args;
}
const args = getArgs();
//console.log(args);
//http://localhost:6001
let run = new Node(args);
//# sourceMappingURL=node.js.map