"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateDSPBid = simulateDSPBid;
exports.runAuction = runAuction;
const express_1 = require("express");
const database_1 = require("../database");
const websocket_1 = require("../websocket");
const router = (0, express_1.Router)();
function simulateDSPBid(dsp, adRequest) {
    const targeting = JSON.parse(dsp.targeting_rules);
    // Check if DSP targets this request
    if (targeting.geo && !targeting.geo.includes(adRequest.geo)) {
        return null;
    }
    if (targeting.device && !targeting.device.includes(adRequest.device)) {
        return null;
    }
    // Calculate bid with random adjustment
    let bidPrice = dsp.base_bid;
    const adjustment = (Math.random() * 0.5 - 0.2);
    bidPrice = bidPrice * (1 + adjustment);
    return {
        dspId: dsp.id,
        dspName: dsp.name,
        bidPrice: parseFloat(bidPrice.toFixed(2)),
        creative: dsp.creative_url
    };
}
function runAuction(bids) {
    if (bids.length === 0)
        return null;
    // Sort by bid price (highest first)
    bids.sort((a, b) => b.bidPrice - a.bidPrice);
    return bids[0];
}
router.post('/ad-request', (req, res) => {
    const { publisherId, geo, device, userId } = req.body;
    if (!publisherId || !geo || !device) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Get all DSPs
    database_1.db.all('SELECT * FROM dsps', [], (err, dsps) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        // Simulate bids from each DSP
        const bids = dsps
            .map(dsp => simulateDSPBid(dsp, { publisherId, geo, device, userId }))
            .filter((bid) => bid !== null);
        // Run auction
        const winner = runAuction(bids);
        // Store request in database
        const status = winner ? 'filled' : 'no_fill';
        const winnerDspId = winner ? winner.dspId : null;
        const winningBid = winner ? winner.bidPrice : null;
        database_1.db.run(`INSERT INTO ad_requests (publisher_id, geo, device, user_id, winner_dsp_id, winning_bid, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [publisherId, geo, device, userId || null, winnerDspId, winningBid, status], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to log request' });
            }
            const result = {
                requestId: this.lastID,
                status,
                winner: winner ? {
                    dspName: winner.dspName,
                    bidPrice: winner.bidPrice,
                    creative: winner.creative
                } : null,
                totalBids: bids.length
            };
            // Broadcast real-time update
            (0, websocket_1.broadcast)({
                type: 'ad_request',
                data: {
                    ...result,
                    publisherId,
                    geo,
                    device,
                    timestamp: new Date().toISOString()
                }
            });
            res.json(result);
        });
    });
});
exports.default = router;
//# sourceMappingURL=adRequest.js.map