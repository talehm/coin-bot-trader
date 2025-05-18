
import React, { useState, useEffect, useCallback } from 'react';
import PriceChart from '@/components/trading/PriceChart';
import TradeControls from '@/components/trading/TradeControls';
import TradingMetrics from '@/components/trading/TradingMetrics';
import RecentTrades from '@/components/trading/RecentTrades';
import { useTrading, TradingAction, PendingOrder } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { 
    settings, 
    currentPrice, 
    targetPrice, 
    pendingOrder, 
    simulateTargetPriceReached, 
    metrics 
  } = useTrading();
  
  // Calculate percentage to target
  const calculatePercentToTarget = () => {
    if (!currentPrice || !targetPrice) return null;
    
    const percentDiff = ((targetPrice - currentPrice) / currentPrice) * 100;
    return percentDiff.toFixed(2);
  };
  
  const percentToTarget = calculatePercentToTarget();
  
  // Mocked additional pending orders for display purposes
  const mockedPendingOrders: PendingOrder[] = [
    {
      id: 'mocked-order-1',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      pair: 'BTCUSDT',
      action: 'buy' as TradingAction,
      targetPrice: 19850.75,
      amount: 0.05,
      status: 'pending'
    },
    {
      id: 'mocked-order-2',
      timestamp: Date.now() - 3600000, // 1 hour ago
      pair: 'ETHUSDT',
      action: 'sell' as TradingAction,
      targetPrice: 1580.25,
      amount: 1.2,
      status: 'pending'
    }
  ];
  
  // Combine real pending order with mocked ones for display
  const displayOrders = pendingOrder 
    ? [pendingOrder, ...mockedPendingOrders] 
    : mockedPendingOrders;

  // Function to handle simulating target price reached
  const handleSimulateExecution = useCallback((order: PendingOrder) => {
    simulateTargetPriceReached(order);
    toast.success(`Simulated ${order.pair} reaching target price of $${order.targetPrice.toFixed(2)}`);
    
    // Show profit update notification
    const profitAmount = order.action === 'sell' ? 
      (order.targetPrice * order.amount * settings.ratePercentage / 100).toFixed(2) : 0;
    
    if (order.action === 'sell') {
      toast.success(`Profit increased by $${profitAmount}`, {
        duration: 3000,
        className: "bg-profit/10 border-profit text-profit"
      });
    }
  }, [simulateTargetPriceReached, settings.ratePercentage]);
  
  // Debug execution conditions
  useEffect(() => {
    if (currentPrice && settings.isActive && displayOrders.length > 0) {
      console.log(`Current price: $${currentPrice.toFixed(2)}`);
      
      displayOrders.forEach(order => {
        const priceDiff = currentPrice - order.targetPrice;
        const isPriceMet = order.action === 'buy' 
          ? currentPrice <= order.targetPrice 
          : currentPrice >= order.targetPrice;
        
        console.log(
          `Order: ${order.action} ${order.pair} at $${order.targetPrice.toFixed(2)} - ` +
          `Price diff: ${priceDiff.toFixed(2)} - ` +
          `Condition met: ${isPriceMet ? 'YES' : 'NO'}`
        );
      });
    }
  }, [currentPrice, displayOrders, settings.isActive]);
  
  // Function to check and execute orders based on price conditions
  // Removing redundant settings.isActive check as we control this at the useEffect level
  const checkAndExecuteOrders = useCallback(() => {
    if (!currentPrice || displayOrders.length === 0) return;
    
    console.log(`[${new Date().toLocaleTimeString()}] Checking price conditions for ${displayOrders.length} orders...`);
    
    // Create a copy to avoid modification during iteration issues
    const ordersToProcess = [...displayOrders];
    
    // Check if any orders should be executed based on current price
    ordersToProcess.forEach(order => {
      // Buy orders execute when price falls to target or below
      // Sell orders execute when price rises to target or above
      const isPriceMet = order.action === 'buy' 
        ? currentPrice <= order.targetPrice 
        : currentPrice >= order.targetPrice;
      
      console.log(`Checking execution for ${order.pair} ${order.action}: Current $${currentPrice} vs Target $${order.targetPrice} - Execute: ${isPriceMet}`);
        
      if (isPriceMet) {
        console.log(`EXECUTING ${order.action} order for ${order.pair} at ${order.targetPrice}`);
        
        // Toast notification that order was executed automatically
        toast.info(`${order.pair} reached target price of $${order.targetPrice.toFixed(2)}. Executing ${order.action.toUpperCase()} order automatically.`);
        
        // Execute the order with a slight delay to avoid state update issues
        setTimeout(() => {
          simulateTargetPriceReached(order);
        
          // Show profit update notification if it's a sell order
          if (order.action === 'sell') {
            const profitAmount = (order.targetPrice * order.amount * settings.ratePercentage / 100).toFixed(2);
            
            toast.success(`Profit increased by $${profitAmount}`, {
              duration: 3000,
              className: "bg-profit/10 border-profit text-profit"
            });
          }
        }, 10);
      }
    });
  }, [currentPrice, displayOrders, simulateTargetPriceReached, settings.ratePercentage]);
  
  // Setup interval to check price conditions every 10 seconds
  useEffect(() => {
    // Only run this effect when trading is active
    if (!settings.isActive) return;
    
    // Initial check when component mounts or dependencies change
    checkAndExecuteOrders();
    
    // Set up 10-second interval for checking orders
    const intervalId = setInterval(() => {
      checkAndExecuteOrders();
    }, 10000); // 10000 milliseconds = 10 seconds
    
    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [checkAndExecuteOrders, settings.isActive]);
  
  // Auto execute orders when price conditions are met (on price change)
  useEffect(() => {
    // Only check orders when trading is active and price changes
    if (currentPrice && settings.isActive) {
      checkAndExecuteOrders();
    }
  }, [currentPrice, checkAndExecuteOrders, settings.isActive]);
  
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
      
      {/* Performance Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg border border-border bg-secondary/5">
          <div className="text-xs text-muted-foreground">Total Trades</div>
          <div className="text-xl font-semibold mt-1">{metrics.totalTrades}</div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-secondary/5">
          <div className="text-xs text-muted-foreground">Total Profit</div>
          <div className={`text-xl font-semibold mt-1 ${metrics.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            ${metrics.totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-secondary/5">
          <div className="text-xs text-muted-foreground">Success Rate</div>
          <div className="text-xl font-semibold mt-1">{metrics.winRate.toFixed(1)}%</div>
        </div>
      </div>
      
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
                  <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="py-3 text-sm text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => handleSimulateExecution(order)}
                      >
                        Simulate
                      </Button>
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
