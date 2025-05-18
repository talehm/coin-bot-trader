
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrading, Trade, TradingAction } from '@/contexts/TradingContext';
import { formatDistanceToNow } from 'date-fns';

const RecentTrades: React.FC = () => {
  const { trades } = useTrading();

  // Get the most recent trades (max 5)
  const recentTrades = trades.slice(0, 5);

  // Helper to format the action display
  const formatAction = (action: TradingAction) => {
    return action === 'buy' ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-profit/20 text-profit rounded-full">
        BUY
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-loss/20 text-loss rounded-full">
        SELL
      </span>
    );
  };

  // Helper to format the timestamp
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTrades.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No recent trades</p>
        ) : (
          <div className="space-y-4">
            {recentTrades.map((trade: Trade) => (
              <div 
                key={trade.id} 
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center">
                  {formatAction(trade.action)}
                  <div className="ml-3">
                    <p className="text-sm font-medium">{trade.pair}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(trade.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${trade.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{trade.amount} {trade.pair.substring(0, 3)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTrades;
