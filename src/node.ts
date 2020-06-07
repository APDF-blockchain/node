import { P2P } from './p2p';
import { HttpServer } from './httpserver';
import { BlockChain } from './blockchain';
import { Config } from './config';

/**
 * @classdesc - This class is the main of the entire blockchain.  Many of these can be run as peers.
 * @class Node
 */
export class Node {

    /**
     * @description - the entire blockchain
     */
    public blockchain: BlockChain;
    /**
     * @description - the peer-to-peer server
     */
    public p2p: P2P;
    /**
     * @description - the http server that responds to http requests
     */
    public httpServer: HttpServer;
    /**
     * @description - configuration object
     */
    public config: Config = new Config();
    /**
     * @description - http port for the http server
     */
    public httpPort: number = parseInt(process.env.HTTP_PORT) || this.config.defaultServerPort;
    /**
     * @description - p2p port number for the p2p server
     */
    public p2pPort: number = parseInt(process.env.P2P_PORT) || this.config.defaultP2pPort;
    /**
     * @description - comma separated list of peer urls.
     */
    public initialPeers: string[] = process.env.PEERS ? process.env.PEERS.split(',') : [];

    /**
     * @description - This constructor sets up the http and p2p servers and listens on their respective ports
     * @constructor
     */
    constructor(args: any) {
        // let peer: string = args.peer;
        // let peer: string = "http://localhost:6002";
        // if (peer !== null) {
        //     this.initialPeers.push(peer);
        // }
        //console.log(this.initialPeers);
        this.blockchain = new BlockChain();
        /**
         * The blockchain and the p2p call into each other.
         */
        this.p2p = new P2P(this.blockchain);
        this.blockchain.setP2PService(this.p2p);

        /**
         * The http server talks to both the blockchain and the p2p
         */
        this.httpServer = new HttpServer(this.blockchain, this.p2p);
        //this.p2p.connectToPeers(this.initialPeers);
        this.httpServer.initHttpServer(this.httpPort);
        this.p2p.initP2PServer(this.p2pPort);
        this.p2p.connectToPeers(this.initialPeers);
    }
}
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