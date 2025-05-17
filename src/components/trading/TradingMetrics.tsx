
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrading } from '@/contexts/TradingContext';

const TradingMetrics: React.FC = () => {
  const { metrics, trades } = useTrading();
  
  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle>Trading Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="stats-label">Total Trades</p>
            <p className="stats-value">{metrics.totalTrades}</p>
          </div>
          
          <div>
            <p className="stats-label">Success Rate</p>
            <p className="stats-value">{metrics.winRate.toFixed(1)}%</p>
          </div>
          
          <div>
            <p className="stats-label">Total Profit</p>
            <p className={`stats-value ${metrics.totalProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
              ${metrics.totalProfit.toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="stats-label">ROI</p>
            <p className={`stats-value ${metrics.roi >= 0 ? 'profit-text' : 'loss-text'}`}>
              {metrics.roi.toFixed(2)}%
            </p>
          </div>
          
          <div>
            <p className="stats-label">Last Trade</p>
            <p className="stats-value">
              {trades.length > 0 
                ? new Date(trades[0].timestamp).toLocaleTimeString() 
                : 'N/A'
              }
            </p>
          </div>
          
          <div>
            <p className="stats-label">Today's Trades</p>
            <p className="stats-value">
              {trades.filter(trade => {
                const today = new Date();
                const tradeDate = new Date(trade.timestamp);
                return tradeDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingMetrics;
