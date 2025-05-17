
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrading, PriceData } from '@/contexts/TradingContext';
import { formatDistanceToNow } from 'date-fns';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2 rounded-md shadow-lg">
        <p className="text-sm font-medium">
          ${data.price.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      </div>
    );
  }
  return null;
};

const formatTime = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

interface PriceChartProps {
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ height = 400 }) => {
  const { currentPrice, priceHistory, settings } = useTrading();

  // Calculate price change percentage
  const priceChange = priceHistory.length > 1 
    ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / priceHistory[0].price) * 100
    : 0;

  // Format the chart data
  const data = priceHistory.map((point: PriceData) => ({
    timestamp: point.timestamp,
    price: point.price
  }));

  return (
    <Card className="trading-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{settings.coinPair}</CardTitle>
            <CardDescription>
              Current price: ${currentPrice?.toFixed(2)}
            </CardDescription>
          </div>
          <div className={`text-right ${priceChange >= 0 ? 'text-profit' : 'text-loss'}`}>
            <div className="text-lg font-bold">
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(priceHistory[0]?.timestamp || Date.now()), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
                minTickGap={50}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
                width={60}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
