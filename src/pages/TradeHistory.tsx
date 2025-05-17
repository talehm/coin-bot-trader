
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrading, Trade, TradingAction } from '@/contexts/TradingContext';

const TradeHistory: React.FC = () => {
  const { trades } = useTrading();

  // Helper to format the timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

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
  
  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No trades found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-medium">Time</th>
                    <th className="text-left py-3 font-medium">Pair</th>
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-right py-3 font-medium">Price</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                    <th className="text-right py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade: Trade) => (
                    <tr 
                      key={trade.id} 
                      className="border-b border-border hover:bg-secondary/10"
                    >
                      <td className="py-3 text-sm">{formatTime(trade.timestamp)}</td>
                      <td className="py-3 text-sm">{trade.pair}</td>
                      <td className="py-3">{formatAction(trade.action)}</td>
                      <td className="py-3 text-sm text-right">${trade.price.toFixed(2)}</td>
                      <td className="py-3 text-sm text-right">{trade.amount}</td>
                      <td className="py-3 text-sm text-right">${trade.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeHistory;
