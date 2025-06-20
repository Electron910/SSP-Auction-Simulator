export interface DSP {
  id: number;
  name: string;
  targeting_rules: string;
  base_bid: number;
  creative_url: string;
  created_at: string;
}

export interface TargetingRules {
  geo?: string[];
  device?: string[];
}

export interface AdRequest {
  publisherId: string;
  geo: string;
  device: string;
  userId?: string;
}

export interface AdRequestRecord {
  id: number;
  publisher_id: string;
  geo: string;
  device: string;
  user_id: string | null;
  winner_dsp_id: number | null;
  winning_bid: number | null;
  status: 'filled' | 'no_fill';
  created_at: string;
  dsp_name?: string;
}

export interface Bid {
  dspId: number;
  dspName: string;
  bidPrice: number;
  creative: string;
}

export interface AuctionResult {
  requestId: number;
  status: 'filled' | 'no_fill';
  winner: {
    dspName: string;
    bidPrice: number;
    creative: string;
  } | null;
  totalBids: number;
}

export interface Analytics {
  totalRequests: number;
  filledRequests: number;
  fillRate: number;
  dspPerformance: DSPPerformance[];
  cpmTrend: CPMTrend[];
}

export interface DSPPerformance {
  id: number;
  name: string;
  wins: number;
  avg_cpm: number | null;
  winRate: number;
}

export interface CPMTrend {
  date: string;
  avg_cpm: number | null;
  requests: number;
}

export interface WebSocketMessage {
  type: 'ad_request' | 'dsp_update' | 'analytics_update';
  data: any;
}