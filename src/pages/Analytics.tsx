
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTrading } from '@/contexts/TradingContext';

const Analytics: React.FC = () => {
  const { trades, metrics } = useTrading();

  // Group trades by day for the chart
  const tradesByDay = React.useMemo(() => {
    const grouped = trades.reduce((acc: Record<string, { date: string, count: number }>, trade) => {
      const date = new Date(trade.timestamp).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0
        };
      }
      
      acc[date].count++;
      return acc;
    }, {});
    
    return Object.values(grouped);
  }, [trades]);

  // Calculate trade distribution by type (buy/sell)
  const tradeTypesData = React.useMemo(() => {
    const buyCount = trades.filter(trade => trade.action === 'buy').length;
    const sellCount = trades.filter(trade => trade.action === 'sell').length;
    
    return [
      { name: 'Buy', value: buyCount },
      { name: 'Sell', value: sellCount }
    ];
  }, [trades]);

  const COLORS = ['#0ecb81', '#f6465d'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Trades Per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tradesByDay}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Trade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tradeTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {tradeTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Trading Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm text-muted-foreground">Total Trades</h3>
              <p className="text-2xl font-bold">{metrics.totalTrades}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Success Rate</h3>
              <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Total Profit</h3>
              <p className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                ${metrics.totalProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">ROI</h3>
              <p className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-profit' : 'text-loss'}`}>
                {metrics.roi.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
