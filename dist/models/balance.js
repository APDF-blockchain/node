"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
/**
 * @classdesc - This class contains the balance information for the accountAddress
 * @class Balance
 */
class Balance {
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
exports.Balance = Balance;
//# sourceMappingURL=balance.js.map