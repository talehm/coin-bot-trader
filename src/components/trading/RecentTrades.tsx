
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrading, Trade, TradingAction } from '@/contexts/TradingContext';
import { formatDistanceToNow } from 'date-fns';

const RecentTrades: React.FC = () => {
  const { trades } = useTrading();

  // Deduplicate trades based on key attributes to prevent duplicates in the UI
  const deduplicatedTrades = useMemo(() => {
    const uniqueTrades = new Map();
    
    // Use the first occurrence of each trade based on time and price
    trades.forEach(trade => {
      const tradeKey = `${trade.pair}-${trade.action}-${trade.price}-${Math.floor(trade.timestamp/1000)}`;
      if (!uniqueTrades.has(tradeKey)) {
        uniqueTrades.set(tradeKey, trade);
      }
    });
    
    // Convert back to array and return the most recent 5
    return Array.from(uniqueTrades.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [trades]);

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
        {deduplicatedTrades.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No recent trades</p>
        ) : (
          <div className="space-y-4">
            {deduplicatedTrades.map((trade: Trade) => (
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
