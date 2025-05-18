
import React from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const { settings, currentPrice, targetPrice, pendingOrder } = useTrading();
  
  // Calculate percentage to target
  const calculatePercentToTarget = () => {
    if (!currentPrice || !targetPrice) return null;
    
    const percentDiff = ((targetPrice - currentPrice) / currentPrice) * 100;
    return percentDiff.toFixed(2);
  };
  
  const percentToTarget = calculatePercentToTarget();
  
  return (
    <div className="space-y-6">
      {/* Pending Order Status Display */}
      {settings.isActive && pendingOrder && (
        <div className={`p-3 rounded-lg border ${pendingOrder.action === 'buy' ? 'border-profit bg-profit/10' : 'border-loss bg-loss/10'} mb-2`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Pending {pendingOrder.action.toUpperCase()} Order</span>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingOrder.amount} {pendingOrder.pair.substring(0, 3)} at ${pendingOrder.targetPrice.toFixed(2)}
              </p>
            </div>
            {percentToTarget && (
              <div className="text-right">
                <span className="text-sm font-medium">
                  {Math.abs(Number(percentToTarget))}% 
                  {Number(percentToTarget) > 0 ? ' increase' : ' decrease'} needed
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Current: ${currentPrice?.toFixed(2)} 
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div>
          <TradeControls />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingMetrics />
        <RecentTrades />
      </div>

      {/* Open Orders Section */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Open Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingOrder ? (
            <p className="text-center text-muted-foreground py-6">No open orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-medium">Time</th>
                    <th className="text-left py-3 font-medium">Pair</th>
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-right py-3 font-medium">Target Price</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                    <th className="text-right py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-secondary/10">
                    <td className="py-3 text-sm">
                      {new Date(pendingOrder.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 text-sm">{pendingOrder.pair}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${pendingOrder.action === 'buy' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'} rounded-full`}>
                        {pendingOrder.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-right">
                      ${pendingOrder.targetPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-right">{pendingOrder.amount}</td>
                    <td className="py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-500 rounded-full">
                        PENDING
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
