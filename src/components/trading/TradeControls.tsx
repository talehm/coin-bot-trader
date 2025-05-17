
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Play, Pause } from 'lucide-react';
import { useTrading } from '@/contexts/TradingContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TradeControls: React.FC = () => {
  const { 
    settings, 
    startTrading, 
    stopTrading, 
    toggleMode,
    currentPrice,
    balance
  } = useTrading();

  const { mode, isActive } = settings;

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle>Trading Controls</CardTitle>
        <CardDescription>Manage your automated trading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trading Mode Toggle */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-sm font-medium">Trading Mode</h3>
            <p className="text-xs text-muted-foreground">Switch between simulation and live trading</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="mode-switch" 
              checked={mode === 'live'} 
              onCheckedChange={toggleMode} 
              disabled={isActive}
            />
            <Label htmlFor="mode-switch" className="text-sm font-medium">
              {mode === 'simulation' ? 'Simulation' : 'Live'}
            </Label>
          </div>
        </div>

        {/* Current Balance Display */}
        <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
          <div>
            <h4 className="text-sm text-muted-foreground">Base Balance (BTC)</h4>
            <p className="text-lg font-medium">{balance.base.toFixed(8)}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Quote Balance (USDT)</h4>
            <p className="text-lg font-medium">${balance.quote.toFixed(2)}</p>
          </div>
        </div>

        {/* Current Price */}
        <div className="border-b border-border pb-4">
          <h4 className="text-sm text-muted-foreground">Current Price</h4>
          <p className="text-lg font-medium">${currentPrice?.toFixed(2) || "Loading..."}</p>
        </div>

        {/* Trading Status */}
        <div className="border-b border-border pb-4">
          <h4 className="text-sm text-muted-foreground">Trading Status</h4>
          <p className={`text-lg font-medium flex items-center ${isActive ? 'text-profit' : 'text-loss'}`}>
            {isActive ? (
              <>
                <span className="mr-2 h-2 w-2 rounded-full bg-profit animate-pulse-slow"></span>
                Active
              </>
            ) : (
              <>
                <span className="mr-2 h-2 w-2 rounded-full bg-loss"></span>
                Inactive
              </>
            )}
          </p>
        </div>

        {/* Start/Stop Trading Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={startTrading} 
            disabled={isActive}
            className="bg-profit hover:bg-profit/80"
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
          <Button 
            onClick={stopTrading}
            disabled={!isActive}
            variant="destructive"
          >
            <Pause className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeControls;
