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
  
  // Add a state to track the order execution cooldown period
  const [isInCooldown, setIsInCooldown] = useState(false);
  
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
    if (isInCooldown) {
      toast.warning("Please wait, cooling down from previous order execution", {
        duration: 3000
      });
      return;
    }
    
    // Set cooldown to true before executing order
    setIsInCooldown(true);
    
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
    
    // Start 10-second cooldown timer
    toast.info("Waiting 10 seconds before processing next order...", {
      duration: 9000
    });
    
    // Clear cooldown after 10 seconds
    setTimeout(() => {
      setIsInCooldown(false);
      toast.info("Ready to process new orders", {
        duration: 2000
      });
    }, 10000);
  }, [simulateTargetPriceReached, settings.ratePercentage, isInCooldown]);
  
  // Debug execution conditions
  useEffect(() => {
    if (currentPrice && settings.isActive && displayOrders.length > 0) {
      console.log(`Current price: $${currentPrice.toFixed(2)}`);
      
      // Only check orders for the currently selected trading pair
      const ordersForCurrentPair = displayOrders.filter(order => order.pair === settings.coinPair);
      
      ordersForCurrentPair.forEach(order => {
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
  }, [currentPrice, displayOrders, settings.isActive, settings.coinPair]);
  
  // Function to check and execute orders based on price conditions
  // Removing redundant settings.isActive check as we control this at the useEffect level
  const checkAndExecuteOrders = useCallback(() => {
    // Don't execute orders during cooldown period
    if (isInCooldown) {
      console.log("In cooldown period, skipping order checks");
      return;
    }
    
    if (!currentPrice || displayOrders.length === 0) return;
    
    console.log(`[${new Date().toLocaleTimeString()}] Checking price conditions for ${displayOrders.length} orders...`);
    
    // Create a copy to avoid modification during iteration issues
    const ordersToProcess = [...displayOrders];
    
    // Filter to only process orders for the current trading pair
    const relevantOrders = ordersToProcess.filter(order => order.pair === settings.coinPair);
    
    console.log(`Found ${relevantOrders.length} orders for current pair ${settings.coinPair}`);
    
    // Check if any orders should be executed based on current price
    for (const order of relevantOrders) {
      // Buy orders execute when price falls to target or below
      // Sell orders execute when price rises to target or above
      const isPriceMet = order.action === 'buy' 
        ? currentPrice <= order.targetPrice 
        : currentPrice >= order.targetPrice;
      
      console.log(`Checking execution for ${order.pair} ${order.action}: Current $${currentPrice} vs Target $${order.targetPrice} - Execute: ${isPriceMet}`);
        
      if (isPriceMet) {
        console.log(`EXECUTING ${order.action} order for ${order.pair} at ${order.targetPrice}`);
        
        // Set cooldown to true before executing order
        setIsInCooldown(true);
        
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
          
          // Start 10-second cooldown timer
          toast.info("Waiting 10 seconds before processing next order...", {
            duration: 9000
          });
          
          // Clear cooldown after 10 seconds
          setTimeout(() => {
            setIsInCooldown(false);
            toast.info("Ready to process new orders", {
              duration: 2000
            });
          }, 10000);
        }, 10);
        
        // Only execute first matching order, then return
        return;
      }
    }
  }, [currentPrice, displayOrders, simulateTargetPriceReached, settings.ratePercentage, settings.coinPair, isInCooldown]);
  
  // Setup interval to check price conditions every 10 seconds
  useEffect(() => {
    // Only run this effect when trading is active and not in cooldown
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
    // Only check orders when trading is active and price changes and not in cooldown
    if (currentPrice && settings.isActive && !isInCooldown) {
      checkAndExecuteOrders();
    }
  }, [currentPrice, checkAndExecuteOrders, settings.isActive, isInCooldown]);
  
  return (
    <div className="space-y-6">
      {/* Cooldown Indicator */}
      {isInCooldown && (
        <div className="p-3 rounded-lg border border-warning bg-warning/10 mb-2 animate-pulse">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-warning">Cooling down</span>
            <span className="text-xs text-muted-foreground">Waiting before processing next order</span>
          </div>
        </div>
      )}
      
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
