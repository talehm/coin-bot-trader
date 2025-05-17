
import React from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading } from '@/contexts/TradingContext';

const Dashboard: React.FC = () => {
  const { settings } = useTrading();
  
  return (
    <div className="space-y-6">
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
