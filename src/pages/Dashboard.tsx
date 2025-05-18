
import React from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const Dashboard: React.FC = () => {
  const { settings, currentPrice, targetPrice, pendingOrder } = useTrading();
  
  // Calculate percentage to target
  const calculatePercentToTarget = () => {
    if (!currentPrice || !targetPrice) return null;
    
    const percentDiff = ((targetPrice - currentPrice) / currentPrice) * 100;
    return percentDiff.toFixed(2);
  };
  
  const percentToTarget = calculatePercentToTarget();
  
  // Mocked additional pending orders for display purposes
  const mockedPendingOrders = [
    {
      id: 'mocked-order-1',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      pair: 'BTCUSDT',
      action: 'buy',
      targetPrice: 19850.75,
      amount: 0.05,
      status: 'pending' as const
    },
    {
      id: 'mocked-order-2',
      timestamp: Date.now() - 3600000, // 1 hour ago
      pair: 'ETHUSDT',
      action: 'sell',
      targetPrice: 1580.25,
      amount: 1.2,
      status: 'pending' as const
    }
  ];
  
  // Combine real pending order with mocked ones for display
  const displayOrders = pendingOrder 
    ? [pendingOrder, ...mockedPendingOrders] 
    : mockedPendingOrders;
  
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
          {displayOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No open orders</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Target Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-secondary/10">
                    <TableCell className="py-3 text-sm">
                      {new Date(order.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-sm">{order.pair}</TableCell>
                    <TableCell className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${order.action === 'buy' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'} rounded-full`}>
                        {order.action.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-right">
                      ${order.targetPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-right">{order.amount}</TableCell>
                    <TableCell className="py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-500 rounded-full">
                        PENDING
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
