
import React from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading } from '@/contexts/TradingContext';

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
    </div>
  );
};

export default Dashboard;
