
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PriceChart from '@/components/trading/PriceChart';
import { useTrading } from '@/contexts/TradingContext';

const Market: React.FC = () => {
  const { currentPrice, settings } = useTrading();

  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground">Current Price</h3>
              <p className="text-2xl font-bold">${currentPrice?.toFixed(2) || "Loading..."}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Trading Pair</h3>
              <p className="text-2xl font-bold">{settings.coinPair}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Mode</h3>
              <p className="text-2xl font-bold">{settings.mode === 'simulation' ? 'Simulation' : 'Live'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Full-size chart for detailed view */}
      <PriceChart height={500} />
      
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Market Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm text-muted-foreground">24h Volume</h3>
              <p className="text-xl font-bold">$1,234,567.89</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">24h High</h3>
              <p className="text-xl font-bold text-profit">$20,123.45</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">24h Low</h3>
              <p className="text-xl font-bold text-loss">$19,876.54</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">24h Change</h3>
              <p className="text-xl font-bold text-profit">+1.23%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 text-profit">Bids</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>$19,950.00</span>
                  <span>0.5432 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$19,925.50</span>
                  <span>1.2345 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$19,900.00</span>
                  <span>3.4567 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$19,875.25</span>
                  <span>2.7654 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$19,850.75</span>
                  <span>5.1234 BTC</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 text-loss">Asks</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>$20,050.00</span>
                  <span>0.6543 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$20,075.25</span>
                  <span>1.3456 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$20,100.00</span>
                  <span>2.5678 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$20,125.50</span>
                  <span>3.7654 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$20,150.75</span>
                  <span>4.8765 BTC</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Market;
