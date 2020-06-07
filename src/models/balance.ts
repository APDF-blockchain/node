/**
 * @classdesc - This class contains the balance information for the accountAddress
 * @class Balance
 */
export class Balance {
    /**
     * @description - address of account holder
     */
    public accountAddress: string;
    /**
     * @description - 1 or more confirmations
     */
    public confirmedBalance: number;
    /**
     * @description - 6 confirmations or more
     */
    public safeBalance: number;
    /**
     * @description - expected balance (0 confirmations)
     */
    public pendingBalance: number;

    /**
     * @description - empty constructor
     * @constructor
     */
    constructor() {
        this.accountAddress = '0000000000000000000000000000000000000000';
        this.confirmedBalance = 0;
        this.pendingBalance = 0;
        this.safeBalance = 0;
    }
}
