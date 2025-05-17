
import React from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading } from '@/contexts/TradingContext';

const Dashboard: React.FC = () => {
  const { settings, currentPrice, targetPrice } = useTrading();
  
  // Calculate percentage to target
  const calculatePercentToTarget = () => {
    if (!currentPrice || !targetPrice) return null;
    
    const percentDiff = ((targetPrice - currentPrice) / currentPrice) * 100;
    return percentDiff.toFixed(2);
  };
  
  const percentToTarget = calculatePercentToTarget();
  
  return (
    <div className="space-y-6">
      {settings.isActive && percentToTarget && (
        <div className={`p-2 rounded-lg ${Number(percentToTarget) > 0 ? 'bg-profit/20' : 'bg-loss/20'} mb-2`}>
          <p className="text-center text-sm">
            {settings.lastAction === 'buy' ? 'Waiting to sell' : 'Waiting to buy'} - 
            Price needs to change by {Math.abs(Number(percentToTarget))}% to reach target
          </p>
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
