import express = require('express');
import * as  bodyParser from 'body-parser';

import { BlockChain } from './blockchain'
import { P2P } from './p2p';
import { Config } from './config';
import { Transaction } from './transaction';
import { NodePeers } from './node-peers';
import { Block } from './block';

export class HttpServer {

    private listenerUrl: string;
    private about: string = "Blockchain Project";
    private nodeId: string = "5967d641bed609abf11933204e3c8d87b9969ee8aea9f1568d1b23bb30453981";  // TODO this needs to be calculated.
    private config: Config;
    private myHttpPort: number;

    constructor(private blockchain: BlockChain, private p2p: P2P) {
        this.config = new Config();
        this.config.genesisBlock = this.blockchain.getGenesisBlock();
    }

    public getListenerUrl(): string {
        return this.listenerUrl;
    }

    public initHttpServer(myHttpPort: number) {
        const app: express.Application = express();
        app.use(bodyParser.json());

        app.use((err, req, res, next) => {
            if (err) {
                res.status(400).send(err.message);
            } else {
                this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            }
        });

        app.get('/blocks', (req, res) => {
            // TODO: For now let's fake it.
            res.send(this.blockchain.getBlockchain());
            //res.send(JSON.stringify(this.blockchain.getBlockchain()));
        });

        app.get('/info', (req, res) => {
            console.log(this.myHttpPort + ':GET /info');
            //this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            // TODO: For now let's fake it.
            this.listenerUrl = req.protocol + "://" + req.get('host');

            let rVal = {
                'about': this.about,
                'nodeId': this.nodeId,
                'chainId': this.blockchain.getChainId(),
                'nodeUrl': this.getListenerUrl(),
                'peers': this.p2p.getPeerCount(),
                'currentDifficulty': this.blockchain.getCurrentDifficulty(),
                'blockCount': this.blockchain.getBlocksCount(),
                'cumulativeDifficulty': this.blockchain.getCumulativeDifficulty(),
                'confirmedTransactions': this.blockchain.getConfirmedTransactionsCount(),
                'pendingTransactions': this.blockchain.getPendingTransactionsCount()
            };
            //res.send(JSON.stringify(rVal));
            res.send(rVal);
        });

        app.get('/debug', (req, res) => {
            console.log(this.myHttpPort + ':GET /debug');
            let hostUrl: string = req.get('host');
            let hostArray: string[] = hostUrl.split(':');
            let rVal = {
                'nodeId': this.nodeId,
                'host': hostArray[0],
                'port': hostArray[1],
                'selfUrl': hostUrl,
                'peers': this.p2p.getPeers(),
                'chain': { 'blocks': this.blockchain.getBlockchain() },
                'chainId': this.blockchain.getChainId(),
                'config': this.config,
                // TODO: For now let's fake it.
                'confirmedBalances:': this.blockchain.getConfirmedBalances()
            };
            res.send(rVal);
        });

        app.get('/debug/reset-chain', (req, res) => {
            console.log(this.myHttpPort + ':GET /debug/reset-chain');
        });

        app.get('/debug/mine/:minerAddress/:difficulty', (req, res) => {
            let parms = { 'minerAddress': req.params.minerAddress, 'difficulty': req.params.difficulty };
            console.log(this.myHttpPort + ':GET /debug/mine/:minerAddress/:' + parms.minerAddress + '/:' + parms.difficulty);
        });

        app.get('/blocks/:index', (req, res) => {
            console.log(this.myHttpPort + ':GET /blocks/:' + req.params.index);
            let rVal: Block = this.blockchain.getBlockchain()[req.params.index];
            if (rVal == null) {
                res.status(401).send("No block at index=" + req.params.index);
            } else {
                res.send(rVal);
            }
        });

        app.get('/transactions/pending', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/pending');
            let rVal: Transaction[] = this.blockchain.getPendingTransactions();
            // TODO: For now let's fake it.
            let tTran: Transaction = new Transaction();
            tTran.from = 'f3a1e69b6176052fcc4a3248f1c5a91dea308ca9';
            tTran.to = 'a1de0763f26176c6d68cc77e0a1c2c42045f2314';
            tTran.value = 40000;
            tTran.fee = 10;
            tTran.dateCreated = new Date();
            tTran.data = 'Faucet -> Alice (again)';
            tTran.senderPubKey = '8c4431db61e9095d5794ff53a3ae4171c766cadef015f2e11bec22b98a80f74a0';
            tTran.transactionDataHash = 'd6f958a4501cf7e3d40e8fdfeab16e3ab77721e48b4bc85e1393d69ad414843d';
            tTran.senderSignature.push('9eeac79031dcfef4c7b4c62d22025c7654d4fb0c21c37cf111314653559488c7');
            tTran.senderSignature.push('617488c37966dc2da45e5bd5e53a292841b541b13259920be3ce57e861c2ed9a');
            rVal.push(tTran);
            res.send(rVal);
        });

        app.get('/transactions/confirmed', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/confirmed');
            let rVal: Transaction[] = this.blockchain.getConfirmedTransactions();
            res.send(rVal);
        });

        app.get('/transactions/:tranHash', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/:' + req.params.tranHash);
        });

        app.get('/balances', (req, res) => {
            console.log(this.myHttpPort + ':GET /balances');
            // TODO fake for now.
            res.send(this.blockchain.getConfirmedBalances());
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/transactions');
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/transactions');
        });

        app.get('/address/:address/balance', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/balance');
        });

        app.post('/transactions/send', (req, res) => {
            console.log(this.myHttpPort + ':POST /transactions/send');
            let body: Transaction[] = req.body;
            console.log(body);
            for (let i = 0; i < body.length; i++) {
                this.blockchain.addConfirmedTransaction(body[i]); // TODO: This may be pending only.  We will see.
            }
            res.status(201).send("Transaction send complete.");
        });

        app.get('/peers', (req, res) => {
            console.log(this.myHttpPort + ':GET /peers');
            let rVal: string[] = this.p2p.getPeers();
            if (rVal.length !== 0) {
                for (let i = 0; i < rVal.length; i++) {
                    console.log('peer' + i + ':' + rVal[i]);
                }
                res.send(rVal);
            } else {
                res.status(401).send("There currently no peers for this node.");
            }
        });

        app.post('/peers/connect', (req, res) => {
            console.log(this.myHttpPort + ':POST /peers/connect');
            let body: NodePeers = req.body;
            console.log(body);
            this.p2p.connectToPeer(body.peerUrl);
            res.status(201).send("Peers connect requested.");
        });

        app.post('/peers/notify-new-block', (req, res) => {
            console.log(this.myHttpPort + ':POST /peers/notify-new-block');
        });

        app.post('/stop', (req, res) => {
            res.send({ 'msg': 'stopping server' });
            process.exit();
        });

        app.get('/mining/get-mining-job/:address', (req, res) => {
            console.log(this.myHttpPort + ':GET /mining/get-mining-job/:' + req.params.address);
        });

        app.post('/mining/submit-mined-block', (req, res) => {
            console.log(this.myHttpPort + ':POST /mining/submit-mined-block');
        });


        app.listen(myHttpPort, () => {
            console.log('HttpServer listening http on port: ' + myHttpPort);
            this.myHttpPort = myHttpPort;
        });
    };
}