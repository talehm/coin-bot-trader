
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrading } from '@/contexts/TradingContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings: React.FC = () => {
  const { settings, updateSettings } = useTrading();
  const [formData, setFormData] = useState({
    coinPair: settings.coinPair,
    ratePercentage: settings.ratePercentage,
    amount: settings.amount,
    mode: settings.mode,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleModeChange = (checked: boolean) => {
    setFormData({ ...formData, mode: checked ? 'live' : 'simulation' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (formData.ratePercentage <= 0) {
      toast.error("Rate percentage must be greater than 0");
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error("Trade amount must be greater than 0");
      return;
    }
    
    updateSettings(formData);
    toast.success("Settings updated successfully");
  };

  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Trading Settings</CardTitle>
          <CardDescription>Configure your automated trading parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trading Mode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mode" className="text-base">Trading Mode</Label>
                <Switch 
                  id="mode"
                  checked={formData.mode === 'live'}
                  onCheckedChange={handleModeChange}
                  disabled={settings.isActive}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Current mode: <span className="font-medium">{formData.mode === 'simulation' ? 'Simulation' : 'Live'}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.mode === 'simulation' 
                  ? "Simulation mode uses mock data for testing strategies." 
                  : "Live mode connects to Binance API to execute real trades."}
              </p>
            </div>
            
            {/* Trading Pair */}
            <div className="space-y-2">
              <Label htmlFor="coinPair">Trading Pair</Label>
              <Select 
                value={formData.coinPair} 
                onValueChange={(value) => handleSelectChange('coinPair', value)}
                disabled={settings.isActive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trading pair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  <SelectItem value="XRPUSDT">XRP/USDT</SelectItem>
                  <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Rate Percentage */}
            <div className="space-y-2">
              <Label htmlFor="ratePercentage">Rate Percentage (%)</Label>
              <Input
                id="ratePercentage"
                name="ratePercentage"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.ratePercentage}
                onChange={handleInputChange}
                disabled={settings.isActive}
              />
              <p className="text-xs text-muted-foreground">
                Target percentage gain/loss to trigger trades
              </p>
            </div>
            
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Trade Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={settings.isActive}
              />
              <p className="text-xs text-muted-foreground">
                Amount of base currency to trade (e.g., BTC)
              </p>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={settings.isActive}
            >
              Save Settings
            </Button>
            
            {settings.isActive && (
              <p className="text-sm text-center text-amber-500">
                Stop trading to change settings
              </p>
            )}
          </form>
        </CardContent>
      </Card>
      
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>For live trading mode only</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Binance API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="Enter your Binance API key"
                disabled={settings.isActive || settings.mode === 'simulation'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret">Binance API Secret</Label>
              <Input
                id="apiSecret"
                name="apiSecret"
                type="password"
                placeholder="Enter your Binance API secret"
                disabled={settings.isActive || settings.mode === 'simulation'}
              />
            </div>
            
            <Button 
              className="w-full"
              disabled={settings.isActive || settings.mode === 'simulation'}
            >
              Save API Keys
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Note: API keys are required only for live trading mode
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
