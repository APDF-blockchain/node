# node
This project contains the code for a blockchain.
This code can be found at https://github.com/APDF-blockchain/node

# Run the application
To run this application, run 'npm start' in the root directory of the project.

# JSDoc
1. run npm i typedoc
2. The command in 1. is only required once.
3. Run 'mkdir docs' in the root directory.
4. cd to src
5. run '../node_modules/.bin/typedoc --out ../docs --mode modules .'
6. This will create .html files in the /docs directory.  You can open the index.html file to view 
    the documentation.

# How to start things up
1. To start the first node run 'HTTP_PORT=3001 P2P_PORT=6001 npm start' or 'npm start' which defaults 
    to the 3001 and 6001 ports respectively.
2. To start a second node, run 'HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start'.  This
    will start the second node and add the peer 'ws://localhost:6001' to its list of peers.    
3. To connect the first node to the second node as a peer, run
    curl -d '{"peerUrl":"http://localhost:6002"}' -H "Content-Type: application/json" -X POST http://localhost:3001/peers/connect
4. Now if you do GET: /peers for both http://localhost:3001 and and http://localhost:3002 via the browser
    you will get a list of the peers for each node.

# Some useful curl commands
## This one performs the POST: /transactions/send 
curl -d '[{"from":"0000000000000000000000000000000000000000","to":"f3a1e69b6176052fcc4a3248f1c5a91dea308ca9","value":1000000000000,"fee":0,"dateCreated":"2018-01-01T00:00:00.000Z","data":"genesis tx","senderPubKey":"00000000000000000000000000000000000000000000000000000000000000000","transactionDataHash":"8a684cb8491ee419e7d46a0fd2438cad82d1278c340b5d01974e7beb6b72ecc2","senderSignature":["0000000000000000000000000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000000000000000000000000"],"minedInBlockIndex":0,"transferSuccessful":true},{"from":"0000000000000000000000000000000000000000","to":"84ede81c58f5c490fc6e1a3035789eef897b5b35","value":5000020,"fee":0,"dateCreated":"2020-05-19T12:40:35.991Z","data":"coinbase tx","senderPubKey":"00000000000000000000000000000000000000000000000000000000000000000","transactionDataHash":"2d6088fc093c52f69f8ec9bf736cff76be478a86ec3a73b92e0f6561c7e08801","senderSignature":["0000000000000000000000000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000000000000000000000000"],"minedInBlockIndex":1,"transferSuccessful":true},{"from":"f3a1e69b6176052fcc4a3248f1c5a91dea308ca9","to":"a1de0763f26176c6d68cc77e0a1c2c42045f2314","value":500000,"fee":10,"dateCreated":"2020-05-19T12:25:35.919Z","data":"Faucet -> Alice","senderPubKey":"8c4431db61e9095d5794ff53a3ae4171c766cadef015f2e11bec22b98a80f74a0","transactionDataHash":"2e00101431b8aef8da31f048508d83fc3a6bf9d50b5545ff187cd4542e8ab5be","senderSignature":["81e15a8f8baa63eb1964f215f15a46d413e7eed2e68b9cd66a8048827b083ac1","db1fe10f246403c393f198e1265fe9f3602de6719ebb1ff9567a9730d5e87efc"],"minedInBlockIndex":1,"transferSuccessful":true},{"from":"f3a1e69b6176052fcc4a3248f1c5a91dea308ca9","to":"b3d72ad831b3e9cdbdaeda5ff4ae8e9cf182e548","value":700000,"fee":10,"dateCreated":"2020-05-19T12:27:15.934Z","data":"Faucet -> Bob","senderPubKey":"8c4431db61e9095d5794ff53a3ae4171c766cadef015f2e11bec22b98a80f74a0","transactionDataHash":"46fae5fd7a51e0878065056e629c7cd88a9e01c25d1e80568d99b3118689081d","senderSignature":["3e215c71999d4ae01af84687d4be3c3d3cb44936cd9bb13114c19978715f5bb3","3486c30a4dce5dbbd08bfe2b5305d8541b83fa4e05c468ecf772aad0c8ea20a9"],"minedInBlockIndex":1,"transferSuccessful":true},{"from":"0000000000000000000000000000000000000000","to":"84ede81c58f5c490fc6e1a3035789eef897b5b35","value":5000040,"fee":0,"dateCreated":"2020-05-19T12:40:36.028Z","data":"coinbase tx","senderPubKey":"00000000000000000000000000000000000000000000000000000000000000000","transactionDataHash":"6349c27fe11c97e1de56afb55504a64ed12018ad0945aa4be7a34956ffec9327","senderSignature":["0000000000000000000000000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000000000000000000000000"],"minedInBlockIndex":2,"transferSuccessful":true},{"from":"a1de0763f26176c6d68cc77e0a1c2c42045f2314","to":"b3d72ad831b3e9cdbdaeda5ff4ae8e9cf182e548","value":400000,"fee":20,"dateCreated":"2020-05-19T12:28:55.939Z","data":"Alice -> Bob","senderPubKey":"30f9d17cff6b8a182df541e86344516a774c450be73d0a05624a9db7748c74cf1","transactionDataHash":"343edc64a6414e4cc5a2aa4e9aa798849b623fba766417bd4415b4b0933386b9","senderSignature":["7bc587b8e2d56cdf1586de732a710e5bb0b9c2da0d640e47e911586b49ea2cce","d84324f3e696635708e0c42f18cc59ee28b1a3744851ac3a61707e02eb271962"],"minedInBlockIndex":2,"transferSuccessful":true},{"from":"a1de0763f26176c6d68cc77e0a1c2c42045f2314","to":"22e2864c613e4f778bb25ddb2b0022d1fbb11c8c","value":400000,"fee":20,"dateCreated":"2020-05-19T12:28:55.942Z","data":"Alice -> Peter (no funds)","senderPubKey":"30f9d17cff6b8a182df541e86344516a774c450be73d0a05624a9db7748c74cf1","transactionDataHash":"786bb987f15b24a8f53f75f0e1f284ca5d0759b71cf0bc18319ae3ab755711e5","senderSignature":["4fd53f5f1e37c7b7e37497bb87ca97a8ed5da221ed7404d828d7c5d2e76dca0","2da7232a27c94b34c2ac96353ac45f9329543f8290f468caafdce501e0d6de02"],"minedInBlockIndex":2,"transferSuccessful":false}]' -H "Content-Type: application/json" -X POST http://localhost:3001/transactions/send

## This one connects the first node to its peer

curl -d '{"peerUrl":"http://localhost:6002"}' -H "Content-Type: application/json" -X POST http://localhost:3001/peers/connect

## This one will stop the given node

1. curl -H "Content-Type: application/json" -X POST http://localhost:3001/stop
2. curl -H "Content-Type: application/json" -X POST http://localhost:3002/stop



