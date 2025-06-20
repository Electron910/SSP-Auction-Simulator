import sqlite3 from 'sqlite3';
import path from 'path';
import { DSP, AdRequestRecord } from './types';

const db = new sqlite3.Database(path.join(__dirname, '../ssp.db'));

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create DSPs table
      db.run(`
        CREATE TABLE IF NOT EXISTS dsps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          targeting_rules TEXT NOT NULL,
          base_bid REAL NOT NULL,
          creative_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      // Create ad requests table
      db.run(`
        CREATE TABLE IF NOT EXISTS ad_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          publisher_id TEXT NOT NULL,
          geo TEXT NOT NULL,
          device TEXT NOT NULL,
          user_id TEXT,
          winner_dsp_id INTEGER,
          winning_bid REAL,
          status TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (winner_dsp_id) REFERENCES dsps(id)
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      // Insert sample DSPs if none exist
      db.get('SELECT COUNT(*) as count FROM dsps', (err, row: any) => {
        if (!err && row.count === 0) {
          const sampleDSPs = [
            {
              name: 'DSP Alpha',
              targeting_rules: JSON.stringify({ geo: ['US', 'CA'], device: ['mobile', 'desktop'] }),
              base_bid: 2.50,
              creative_url: 'https://via.placeholder.com/300x250/FF6B6B/FFFFFF?text=DSP+Alpha'
            },
            {
              name: 'DSP Beta',
              targeting_rules: JSON.stringify({ geo: ['US', 'UK'], device: ['mobile'] }),
              base_bid: 3.00,
              creative_url: 'https://via.placeholder.com/300x250/4ECDC4/FFFFFF?text=DSP+Beta'
            },
            {
              name: 'DSP Gamma',
              targeting_rules: JSON.stringify({ geo: ['US', 'CA', 'UK'], device: ['desktop'] }),
              base_bid: 2.00,
              creative_url: 'https://via.placeholder.com/300x250/45B7D1/FFFFFF?text=DSP+Gamma'
            }
          ];
          
          const stmt = db.prepare('INSERT INTO dsps (name, targeting_rules, base_bid, creative_url) VALUES (?, ?, ?, ?)');
          sampleDSPs.forEach(dsp => {
            stmt.run(dsp.name, dsp.targeting_rules, dsp.base_bid, dsp.creative_url);
          });
          stmt.finalize();
        }
        resolve();
      });
    });
  });
}

export { db };