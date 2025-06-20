import { Router, Request, Response } from 'express';
import { db } from '../database';
import { broadcast } from '../websocket';
import { AdRequestRecord, DSP, Analytics, TargetingRules } from '../types';

const router = Router();

router.get('/admin/ad-requests', (req: Request, res: Response) => {
  const query = `
    SELECT 
      ar.*,
      d.name as dsp_name
    FROM ad_requests ar
    LEFT JOIN dsps d ON ar.winner_dsp_id = d.id
    ORDER BY ar.created_at DESC
    LIMIT 100
  `;
  
  db.all<AdRequestRecord>(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.get('/admin/dsps', (req: Request, res: Response) => {
  db.all<DSP>('SELECT * FROM dsps', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.get('/admin/analytics', (req: Request, res: Response) => {
  interface QueryResult {
    count?: number;
    id?: number;
    name?: string;
    wins?: number;
    avg_cpm?: number | null;
    date?: string;
    requests?: number;
  }

  const queries = {
    totalRequests: 'SELECT COUNT(*) as count FROM ad_requests',
    filledRequests: 'SELECT COUNT(*) as count FROM ad_requests WHERE status = "filled"',
    dspWinRates: `
      SELECT 
        d.id,
        d.name,
        COUNT(ar.id) as wins,
        AVG(ar.winning_bid) as avg_cpm
      FROM dsps d
      LEFT JOIN ad_requests ar ON d.id = ar.winner_dsp_id
      GROUP BY d.id
    `,
    cpmTrend: `
      SELECT 
        DATE(created_at) as date,
        AVG(winning_bid) as avg_cpm,
        COUNT(*) as requests
      FROM ad_requests
      WHERE status = "filled"
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `
  };
  
  const results: Record<string, QueryResult[]> = {};
  let completed = 0;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all<QueryResult>(query, [], (err, rows) => {
      if (!err) {
        results[key] = rows;
      }
      completed++;
      
      if (completed === Object.keys(queries).length) {
        const totalRequests = results.totalRequests[0].count || 0;
        const filledRequests = results.filledRequests[0].count || 0;
        const fillRate = totalRequests > 0 ? (filledRequests / totalRequests * 100) : 0;
        
        const analytics: Analytics = {
          totalRequests,
          filledRequests,
          fillRate: parseFloat(fillRate.toFixed(2)),
          dspPerformance: results.dspWinRates.map(dsp => ({
            id: dsp.id!,
            name: dsp.name!,
            wins: dsp.wins || 0,
            avg_cpm: dsp.avg_cpm !== undefined ? dsp.avg_cpm : null, // Handle undefined case
            winRate: totalRequests > 0 ? parseFloat(((dsp.wins || 0) / totalRequests * 100).toFixed(2)) : 0
          })),
          cpmTrend: results.cpmTrend.reverse().map(trend => ({
            date: trend.date!,
            avg_cpm: trend.avg_cpm !== undefined ? trend.avg_cpm : null, // Handle undefined case
            requests: trend.requests || 0
          }))
        };
        
        res.json(analytics);
      }
    });
  });
});

// DSP Management Routes
router.post('/admin/dsps', (req: Request, res: Response) => {
  const { name, targetingRules, baseBid, creativeUrl } = req.body;
  
  if (!name || !targetingRules || !baseBid || !creativeUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    'INSERT INTO dsps (name, targeting_rules, base_bid, creative_url) VALUES (?, ?, ?, ?)',
    [name, JSON.stringify(targetingRules), baseBid, creativeUrl],
    function(this: any, err: Error | null) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create DSP' });
      }
      
      // Broadcast DSP update
      broadcast({
        type: 'dsp_update',
        data: { action: 'created', dspId: this.lastID }
      });
      
      res.json({ id: this.lastID, message: 'DSP created successfully' });
    }
  );
});

router.put('/admin/dsps/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, targetingRules, baseBid, creativeUrl } = req.body;
  
  if (!name || !targetingRules || !baseBid || !creativeUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    'UPDATE dsps SET name = ?, targeting_rules = ?, base_bid = ?, creative_url = ? WHERE id = ?',
    [name, JSON.stringify(targetingRules), baseBid, creativeUrl, id],
    function(err: Error | null) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update DSP' });
      }
      
      // Broadcast DSP update
      broadcast({
        type: 'dsp_update',
        data: { action: 'updated', dspId: id }
      });
      
      res.json({ message: 'DSP updated successfully' });
    }
  );
});

export default router;