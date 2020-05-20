import { P2P } from './p2p';
import { HttpServer } from './httpserver';
import { BlockChain } from './blockchain';
import { Config } from './config';
export class Node {

    public blockchain: BlockChain;
    public p2p: P2P;
    public httpServer: HttpServer;
    public config: Config = new Config();
    public httpPort: number = parseInt(process.env.HTTP_PORT) || this.config.defaultServerPort;
    public p2pPort: number = parseInt(process.env.P2P_PORT) || this.config.defaultP2pPort;
    public initialPeers: string[] = process.env.PEERS ? process.env.PEERS.split(',') : [];

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