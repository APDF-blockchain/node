import express = require('express');
import * as  bodyParser from 'body-parser';

import { BlockChain } from './blockchain'

export class HttpServer {

    constructor(private blockchain: BlockChain) {

    }

    public initHttpServer(myHttpPort: number) {
        const app: express.Application = express();
        app.use(bodyParser.json());

        app.use((err, req, res, next) => {
            if (err) {
                res.status(400).send(err.message);
            }
        });

        app.get('/blocks', (req, res) => {
            res.send(this.blockchain.getBlockchain());
        });

        app.get('/blocks/:index', (req, res) => {
            console.log('GET /blocks/:indexdebug');
        });

        app.get('/info', (req, res) => {
            console.log('GET /info');
        });

        app.get('/debug', (req, res) => {
            console.log('GET /debug');
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