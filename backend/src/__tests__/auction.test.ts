// import { simulateDSPBid, runAuction } from '../routes/adRequest';
// import { DSP, AdRequest, Bid } from '../types';

// describe('Auction Logic', () => {
//   const mockDSP: DSP = {
//     id: 1,
//     name: 'Test DSP',
//     targeting_rules: JSON.stringify({ geo: ['US'], device: ['mobile'] }),
//     base_bid: 2.50,
//     creative_url: 'https://example.com/creative',
//     created_at: '2024-01-01'
//   };

//   const mockAdRequest: AdRequest = {
//     publisherId: 'pub123',
//     geo: 'US',
//     device: 'mobile',
//     userId: 'user123'
//   };

//   describe('simulateDSPBid', () => {
//     it('should return bid when targeting matches', () => {
//       const bid = simulateDSPBid(mockDSP, mockAdRequest);
//       expect(bid).not.toBeNull();
//       expect(bid?.dspId).toBe(1);
//       expect(bid?.bidPrice).toBeGreaterThan(0);
//     });

//     it('should return null when geo targeting does not match', () => {
//       const nonMatchingRequest: AdRequest = {
//         ...mockAdRequest,
//         geo: 'UK'
//       };
//       const bid = simulateDSPBid(mockDSP, nonMatchingRequest);
//       expect(bid).toBeNull();
//     });

//     it('should return null when device targeting does not match', () => {
//       const nonMatchingRequest: AdRequest = {
//         ...mockAdRequest,
//         device: 'desktop'
//       };
//       const bid = simulateDSPBid(mockDSP, nonMatchingRequest);
//       expect(bid).toBeNull();
//     });
//   });

//   describe('runAuction', () => {
//     it('should return highest bidder', () => {
//       const bids: Bid[] = [
//         { dspId: 1, dspName: 'DSP 1', bidPrice: 2.50, creative: 'url1' },
//         { dspId: 2, dspName: 'DSP 2', bidPrice: 3.00, creative: 'url2' },
//         { dspId: 3, dspName: 'DSP 3', bidPrice: 2.75, creative: 'url3' }
//       ];
      
//       const winner = runAuction(bids);
//       expect(winner).not.toBeNull();
//       expect(winner?.dspId).toBe(2);
//       expect(winner?.bidPrice).toBe(3.00);
//     });

//     it('should return null for empty bids', () => {
//       const winner = runAuction([]);
//       expect(winner).toBeNull();
//     });
//   });
// });