import express = require('express');
import * as  bodyParser from 'body-parser';

import { BlockChain } from './blockchain'
import { P2P } from './p2p';
import { Config } from './config';

export class HttpServer {

    private listenerUrl: string;
    private about: string = "Blockchain Project";
    private nodeId: string = "17228da872ebe975d676d904";  // TODO this needs to be calculated.
    private config: Config;

    constructor(private blockchain: BlockChain, private p2p: P2P) {
        this.config = new Config();
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
            res.send(this.blockchain.getBlockchain());
            //res.send(JSON.stringify(this.blockchain.getBlockchain()));
        });

        app.get('/blocks/:index', (req, res) => {
            console.log('GET /blocks/:indexdebug');
        });

        app.get('/info', (req, res) => {
            console.log('GET /info');
            //this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            this.listenerUrl = req.protocol + "://" + req.get('host');
            ;
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
            console.log('GET /debug');
            let rVal = {
                'nodeId': this.nodeId,
                'host': req.get('host'),
            };
        });

        app.get('/debug/reset-chain', (req, res) => {
            console.log('GET /debug/reset-chain');
        });

        app.get('/debug/mine/:minerAddress/:difficulty', (req, res) => {
            let parms = {'minerAddress': req.params.minerAddress, 'difficulty': req.params.difficulty};
            console.log('GET /debug/mine/:minerAddress/:' + parms.minerAddress + '/:' + parms.difficulty);
        });

        app.get('/blocks/:index', (req, res) => {
            console.log('GET /blocks/:indexdebug' + req.params.index);
        });

        app.get('/transactions/pending', (req, res) => {
            console.log('GET /transactions/pending');
        });

        app.get('/transactions/confirmed', (req, res) => {
            console.log('GET /transactions/confirmed');
        });

        app.get('/transactions/:tranHash', (req, res) => {
            console.log('GET /transactions/:' + req.params.tranHash);
        });

        app.get('/balances', (req, res) => {
            console.log('GET /balances');
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log('GET /address/:' + req.params.address + '/transactions');
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log('GET /address/:' + req.params.address + '/transactions');
        });

        app.get('/address/:address/balance', (req, res) => {
            console.log('GET /address/:' + req.params.address + '/balance');
        });

        app.post('/transactions/send', (req, res) => {
            console.log('POST /transactions/send');
        });

        app.get('/peers', (req, res) => {
            console.log('GET /peers');
        });

        app.post('/peers/connet', (req, res) => {
            console.log('POST /peers/connet');
        });

        app.post('/peers/notify-new-block', (req, res) => {
            console.log('POST /peers/notify-new-block');
        });

        app.post('/stop', (req, res) => {
            res.send({ 'msg': 'stopping server' });
            process.exit();
        });

        app.get('/mining/get-mining-job/:address', (req, res) => {
            console.log('GET /mining/get-mining-job/:' + req.params.address);
        });

        app.post('/mining/submit-mined-block', (req, res) => {
            console.log('POST /mining/submit-mined-block');
        });


        app.listen(myHttpPort, () => {
            console.log('HttpServer listening http on port: ' + myHttpPort);
        });
    };
}