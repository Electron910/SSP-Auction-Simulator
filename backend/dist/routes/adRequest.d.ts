import { DSP, AdRequest, Bid } from '../types';
declare const router: import("express-serve-static-core").Router;
export declare function simulateDSPBid(dsp: DSP, adRequest: AdRequest): Bid | null;
export declare function runAuction(bids: Bid[]): Bid | null;
export default router;
//# sourceMappingURL=adRequest.d.ts.map