import { Router, Request, Response } from 'express';
import { db } from '../database';
import { broadcast } from '../websocket';
import { DSP, AdRequest, Bid, TargetingRules, AuctionResult } from '../types';

const router = Router();

export function simulateDSPBid(dsp: DSP, adRequest: AdRequest): Bid | null {
  const targeting: TargetingRules = JSON.parse(dsp.targeting_rules);
  
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

export function runAuction(bids: Bid[]): Bid | null {
  if (bids.length === 0) return null;
  
  // Sort by bid price (highest first)
  bids.sort((a, b) => b.bidPrice - a.bidPrice);
  
  return bids[0];
}

router.post('/ad-request', (req: Request, res: Response) => {
  const { publisherId, geo, device, userId } = req.body as AdRequest;
  
  if (!publisherId || !geo || !device) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get all DSPs
  db.all<DSP>('SELECT * FROM dsps', [], (err, dsps) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Simulate bids from each DSP
    const bids = dsps
      .map(dsp => simulateDSPBid(dsp, { publisherId, geo, device, userId }))
      .filter((bid): bid is Bid => bid !== null);
    
    // Run auction
    const winner = runAuction(bids);
    
    // Store request in database
    const status = winner ? 'filled' : 'no_fill';
    const winnerDspId = winner ? winner.dspId : null;
    const winningBid = winner ? winner.bidPrice : null;
    
    db.run(
      `INSERT INTO ad_requests (publisher_id, geo, device, user_id, winner_dsp_id, winning_bid, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [publisherId, geo, device, userId || null, winnerDspId, winningBid, status],
      function(this: any, err: Error | null) {
        if (err) {
          return res.status(500).json({ error: 'Failed to log request' });
        }
        
        const result: AuctionResult = {
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
        broadcast({
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
      }
    );
  });
});

export default router;