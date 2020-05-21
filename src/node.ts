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
    constructor() {
        this.blockchain = new BlockChain();
        this.p2p = new P2P(this.blockchain);
        this.httpServer = new HttpServer(this.blockchain, this.p2p);
        this.p2p.connectToPeers(this.initialPeers);
        this.httpServer.initHttpServer(this.httpPort);
        this.p2p.initP2PServer(this.p2pPort);
    }
}

let run = new Node();