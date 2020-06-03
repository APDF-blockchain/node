export class SendTransactionRequest {
    public from: string;
    public to: string;
    public value: number;
    public fee: number;
    public dateCreated: Date;
    public data: string;
    public senderPubKey: string;
    public senderSignature: string[];
    public transferSuccessful: boolean;
    constructor() {

    }
}