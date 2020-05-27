import express = require('express');
import * as  bodyParser from 'body-parser';
import cors from 'cors';

import { BlockChain } from './blockchain'
import { P2P } from './p2p';
import { Config } from './config';
import { Transaction } from './transaction';
import { NodePeers } from './node-peers';
import { Block } from './block';
import { Balance } from './balance';

/**
 * @classdesc - contains the attributes and methods for the http server required by the blockchain
 * @class HttpServer
 */
export class HttpServer {

    /**
     * @description - http listener url
     */
    private listenerUrl: string;
    /**
     * @description - about this block chain
     */
    private about: string = "2020/KingslandUniChain/typescript/Bethany Osueke,Denis Putnam,Olivier Riccini";
    /**
     * @description - the ID of the Node that contains the blockchain
     */
    private nodeId: string;
    /**
     * @description - the configuration for this Node
     */
    private config: Config;
    /**
     * @description - the http port number to listen on for http requests.
     */
    private myHttpPort: number;

    /**
     * @description - initializes this http server
     * @constructor
     * @param {BlockChain} blockchain - blockchain associated with this http server
     * @param {P2P} p2p - the peer-to-peer server associate with this http server 
     */
    constructor(private blockchain: BlockChain, private p2p: P2P) {
        this.config = new Config();
        this.config.genesisBlock = this.blockchain.getGenesisBlock();
    }

    /**
     * @description - get the listener for this http server
     */
    public getListenerUrl(): string {
        return this.listenerUrl;
    }

    /**
     * @description - initialize this http listener for http requests.
     * @param {number} myHttpPort - port number for this listener
     */
    public initHttpServer(myHttpPort: number) {
        this.nodeId = (myHttpPort + Math.random()).toString();
        const app: express.Application = express();
        app.use(bodyParser.json());
        app.use(cors());

        /**
         * @description - http use request
         * @param err - contains any errors in the request
         * @param req - contains the http request object
         * @param res - contains the http response object
         * @param next - contains the http next object.  currently not used.
         */
        app.use((err, req, res, next) => {
            console.log('use() time:', Date.now())
            this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            if (err) {
                res.status(400).send(err.message);
            }
        });

        app.get('/blocks', (req, res) => {
            res.send(this.blockchain.getBlockchain());
        });

        app.get('/info', (req, res) => {
            console.log(this.myHttpPort + ':GET /info');
            //this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
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
                'balances:': this.blockchain.getBalances()
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
            res.send(rVal);
        });

        app.get('/transactions/confirmed', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/confirmed');
            let rVal: Transaction[] = this.blockchain.getConfirmedTransactions();
            res.send(rVal);
        });

        app.get('/transactions/:tranHash', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/:' + req.params.tranHash);
            let rVal: Transaction[] = this.blockchain.getTransactionsByTxHash(req.params.tranHash);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no transaction for " + req.params.tranHash + ".");
            }
        });

        app.get('/balances', (req, res) => {
            console.log(this.myHttpPort + ':GET /balances');
            // TODO fake for now.
            let rVal: any[] = this.blockchain.getBalances();
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no balances available");
            }
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/transactions');
            let rVal: Transaction[] = this.blockchain.getTransactions(req.params.address);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no transaction for " + req.params.address + ".");
            }
        });

        app.get('/address/:address/balance', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/balance');
            let rVal: Balance = this.blockchain.getAccountBalance(req.params.address);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no balances available for the address of " + req.params.address);
            }

        });

        /**
         * @description - add transactions to the transaction pool.
         */
        app.post('/transactions/send', (req, res) => {
            /**
             * Send Transactions
                + For each received transaction the Node does the following:
                    o Checks for missing / invalid fields / invalid field values
                    o Calculates the transaction data hash (unique transaction
                        o Checks for collisions  duplicated transactions are skipped
                    o Validates the transaction public key , validates the signature
                    o Checks the sender account balance to be >= value + fee
                    o Checks whether value >= 0 and fee > 10 (min fee)
                    o Puts the transaction in the "pending transactions " pool
                    o Sends the transaction to all peer nodes through the REST API
                        o It goes from peer to peer until it reaches the entire network
            */
            console.log(this.myHttpPort + ':POST /transactions/send');
            let body: Transaction[] = req.body;
            console.log(body);
            for (let i = 0; i < body.length; i++) {
                body[i].tranferSuccessful = false;
                this.blockchain.handleReceivedTransaction(body[i]);
            }
            if (body !== null) {
                res.status(201).send("Transaction send complete.");
            } else {
                res.status(401).send("No transactions were received.");
            }
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
            if( req.params.address === 'undefined') {
                res.status(401).send("Bad address requested.");
                return;
            }
            /**
             * KINGSLAND SCHOOL OF BLOCKCHAIN | ENSURING THE FUTURE OF BLOCKCHAIN
                The Mining Process: Preparation
                    When a Miner requests a block for mining , the node prepares
                    o Creates the next block candidate : executes all pending transactions
                    and adds them in the block candidate + inserts a coinbase tx
                    o Calculates the block data hash and provides it to the miner
                    o The Node keeps a separate block candidate for each mining request
                        It holds map< blockDataHash  block>
                    o If a miner requests a block candidate again , the Node sends an
                    updated block (eventually holding more
                    o The Node will always return the latest block for mining , holding the
                    latest pending transactions (to collect maximum

                The Coinbase Transaction (Reward)
                    A special coinbase transaction is inserted before all transactions
                    in the candidate block, to transfer the block reward + fees
                        o The sender address, sender public key and signature are zeroes
                    { "from": "0000000000000000000000000000000000000000",
                      "to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
                      "value": 5000350, 
                      "fee": 0 , 
                      "dateCreated": "2018 02 10T17:53:48.972Z",
                      "data": "coinbase tx",
                      "senderPubKey": "000000000000000000000000000000000000…0000",
                      "transactionDataHash": "4dfc3e0ef89ed603ed54e47435a18b…176a",
                      "senderSignature": ["0000 000000 …0000", "0 00 000 0000 …0000"],
                      "minedInBlockIndex": 35, 
                      "transferSuccessful": true
                    }
                    The last two values are set by the miner.
                */
            //let myMap = this.blockchain.getMiningRequestMap();
            // TODO: How do I tell if this is a new block.
            let myBlock: Block;
            let tVar = this.blockchain.getMiningRequestMap().get(req.params.address);
            
            if (this.blockchain.getMiningRequestMap().get(req.params.address) === undefined) {
                //let newBlock: Block = new Block();
                let newBlock: Block = this.blockchain.createMinerBlock(req.params.address);

                this.blockchain.getMiningRequestMap().set(newBlock.blockDataHash, newBlock);
                myBlock = newBlock;
            } else {
                console.log('Need to update the block.')
                // TODO: need to perform this logic.
                myBlock = this.blockchain.getMiningRequestMap().get(req.params.address);
                myBlock = this.blockchain.updateMinerBlock(req.params.address,myBlock);

                this.blockchain.getMiningRequestMap().set(myBlock.blockDataHash, myBlock);
            }
            console.log('Returning: ', myBlock);
            res.send(myBlock);
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