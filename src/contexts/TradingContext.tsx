import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Types
export type TradingMode = 'simulation' | 'live';
export type CoinPair = string;
export type TradingAction = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'completed' | 'failed';

export interface Trade {
  id: string;
  timestamp: number;
  pair: string;
  action: TradingAction;
  price: number;
  amount: number;
  total: number;
  status: OrderStatus;
  mode: TradingMode;
}

export interface PendingOrder {
  id: string;
  timestamp: number;
  pair: string;
  action: TradingAction;
  targetPrice: number;
  amount: number;
  status: OrderStatus;
}

export interface TradingSettings {
  mode: TradingMode;
  coinPair: CoinPair;
  ratePercentage: number;
  amount: number;
  lastAction: TradingAction;
  isActive: boolean;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

interface TradingContextType {
  settings: TradingSettings;
  updateSettings: (settings: Partial<TradingSettings>) => void;
  trades: Trade[];
  pendingOrder: PendingOrder | null;
  currentPrice: number | null;
  targetPrice: number | null;
  priceHistory: PriceData[];
  isLoading: boolean;
  startTrading: () => void;
  stopTrading: () => void;
  toggleMode: () => void;
  balance: {
    base: number; // e.g., BTC
    quote: number; // e.g., USDT
  };
  metrics: {
    totalTrades: number;
    successfulTrades: number;
    totalProfit: number;
    roi: number;
    winRate: number;
  };
  simulateTargetPriceReached: (order: PendingOrder) => void;
}

// Base prices for different crypto pairs
const basePrices: Record<string, number> = {
  'BTCUSDT': 20000,
  'ETHUSDT': 1500,
  'BNBUSDT': 300,
  'XRPUSDT': 0.5,
  'ADAUSDT': 0.35,
};

// Mock data for simulation mode
const MOCK_VOLATILITY = 0.005; // 0.5% price movement per update

// Initial mocked trade for demo purposes
const initialMockedTrades: Trade[] = [
  {
    id: `trade-${Date.now() - 3600000}`,
    timestamp: Date.now() - 3600000, // 1 hour ago
    pair: 'ADAUSDT',
    action: 'buy',
    price: 0.35,
    amount: 100,
    total: 35,
    status: 'completed',
    mode: 'simulation',
  },
  {
    id: `trade-${Date.now() - 7200000}`, // 2 hours ago
    timestamp: Date.now() - 7200000,
    pair: 'BTCUSDT',
    action: 'sell',
    price: 19950.25,
    amount: 0.05,
    total: 997.51,
    status: 'completed',
    mode: 'simulation',
  }
];

// Default settings
const defaultSettings: TradingSettings = {
  mode: 'simulation',
  coinPair: 'BTCUSDT',
  ratePercentage: 1.5,
  amount: 0.01,
  lastAction: 'sell', // Start with buy as first action
  isActive: false,
};

// Create context
const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TradingSettings>(defaultSettings);
  const [trades, setTrades] = useState<Trade[]>(initialMockedTrades);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(basePrices[defaultSettings.coinPair]);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState({ base: 1, quote: 20000 }); // 1 BTC, 20000 USDT
  const [metrics, setMetrics] = useState({
    totalTrades: initialMockedTrades.length,
    successfulTrades: initialMockedTrades.length,
    totalProfit: 0,
    roi: 0,
    winRate: 100, // All successful
  });

  // Function to update settings
  const updateSettings = (newSettings: Partial<TradingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // If coinPair changed, update current price to base price for that pair
    if (newSettings.coinPair && newSettings.coinPair !== settings.coinPair) {
      const newBasePrice = basePrices[newSettings.coinPair] || 0;
      setCurrentPrice(newBasePrice);
      
      // Reset price history when changing pairs
      setPriceHistory([]);
    }
  };

  // Toggle between simulation and live mode
  const toggleMode = () => {
    if (settings.isActive) {
      toast.error("Stop trading before switching modes");
      return;
    }
    
    const newMode = settings.mode === 'simulation' ? 'live' : 'simulation';
    updateSettings({ mode: newMode });
    
    toast.success(`Switched to ${newMode} mode`);
    
    // Reset price history when changing modes
    setPriceHistory([]);
    
    // In a real app, we would connect to the Binance API here
    if (newMode === 'live') {
      toast.info("Live mode is simulated for this demo");
    }
  };

  // Calculate target price based on current price and rate percentage
  const calculateTargetPrice = () => {
    if (!currentPrice) return null;
    
    // If last action was sell, next action is buy at a lower price
    // If last action was buy, next action is sell at a higher price
    const multiplier = settings.lastAction === 'buy' ? 1 + settings.ratePercentage / 100 : 1 - settings.ratePercentage / 100;
    return currentPrice * multiplier;
  };

  // Create a pending order
  const createPendingOrder = () => {
    if (!currentPrice || !targetPrice) return;
    
    const action = settings.lastAction === 'buy' ? 'sell' : 'buy';
    const amount = settings.amount;
    
    const newOrder: PendingOrder = {
      id: `order-${Date.now()}`,
      timestamp: Date.now(),
      pair: settings.coinPair,
      action,
      targetPrice,
      amount,
      status: 'pending',
    };
    
    setPendingOrder(newOrder);
    
    toast.success(`${action.toUpperCase()} order placed at target price: $${targetPrice.toFixed(2)}`);
  };

  // Execute trade when target price is reached
  const executePendingOrder = () => {
    if (!pendingOrder || !currentPrice) return;
    
    const { action, targetPrice, amount } = pendingOrder;
    const total = targetPrice * amount;
    
    // Create a completed trade
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      timestamp: Date.now(),
      pair: settings.coinPair,
      action,
      price: targetPrice,
      amount,
      total,
      status: 'completed',
      mode: settings.mode,
    };
    
    setTrades(prev => [newTrade, ...prev]);
    
    // Update last action
    updateSettings({ lastAction: action });
    
    // Update balances based on the trade
    if (action === 'buy') {
      setBalance(prev => ({
        base: prev.base + amount,
        quote: prev.quote - total,
      }));
    } else {
      setBalance(prev => ({
        base: prev.base - amount,
        quote: prev.quote + total,
      }));
    }
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1,
      successfulTrades: prev.successfulTrades + 1,
      // This is simplified - in reality would calculate actual profit based on buys and sells
      totalProfit: prev.totalProfit + (action === 'sell' ? total * settings.ratePercentage / 100 : 0),
      roi: prev.roi + (action === 'sell' ? settings.ratePercentage : 0),
      winRate: ((prev.successfulTrades + 1) / (prev.totalTrades + 1)) * 100,
    }));
    
    // Clear the pending order
    setPendingOrder(null);
    
    // Calculate new target price for the next trade
    const newTargetPrice = calculateTargetPrice();
    setTargetPrice(newTargetPrice);
    
    // Create a new pending order after 10 seconds delay
    toast.info("Waiting 10 seconds before creating new order...", {
      duration: 9000
    });
    
    setTimeout(() => {
      if (settings.isActive && newTargetPrice) {
        const newOrder: PendingOrder = {
          id: `order-${Date.now()}`,
          timestamp: Date.now(),
          pair: settings.coinPair,
          action: action === 'buy' ? 'sell' : 'buy',
          targetPrice: newTargetPrice,
          amount: settings.amount,
          status: 'pending',
        };
        
        setPendingOrder(newOrder);
        
        toast.success(`New ${newOrder.action.toUpperCase()} order placed at target price: $${newTargetPrice.toFixed(2)}`);
      }
    }, 10000); // 10 seconds delay
    
    toast.success(`${action.toUpperCase()} order executed at $${targetPrice.toFixed(2)}`);
  };

  // Check if target price has been reached to execute the pending order
  const checkPendingOrder = () => {
    if (!pendingOrder || !currentPrice || !settings.isActive) return;
    
    const { action, targetPrice } = pendingOrder;
    
    const shouldExecute = action === 'buy' 
      ? currentPrice <= targetPrice  // For buy orders, execute when price falls to target or below
      : currentPrice >= targetPrice;  // For sell orders, execute when price rises to target or above
    
    if (shouldExecute) {
      executePendingOrder();
    }
  };

  // Start trading
  const startTrading = () => {
    if (settings.isActive || !currentPrice) return;
    
    // Calculate target price when trading starts
    const newTargetPrice = calculateTargetPrice();
    setTargetPrice(newTargetPrice);
    
    updateSettings({ isActive: true });
    
    // Create initial pending order
    if (newTargetPrice) {
      const action = settings.lastAction === 'buy' ? 'sell' : 'buy';
      const newOrder: PendingOrder = {
        id: `order-${Date.now()}`,
        timestamp: Date.now(),
        pair: settings.coinPair,
        action,
        targetPrice: newTargetPrice,
        amount: settings.amount,
        status: 'pending',
      };
      
      setPendingOrder(newOrder);
      
      toast.success(`${action.toUpperCase()} order placed at target price: $${newTargetPrice.toFixed(2)}`);
    }
    
    toast.success("Trading started");
  };

  // Stop trading
  const stopTrading = () => {
    if (!settings.isActive) return;
    
    updateSettings({ isActive: false });
    setTargetPrice(null);
    
    // Cancel any pending orders
    if (pendingOrder) {
      toast.info(`Canceling pending ${pendingOrder.action.toUpperCase()} order`);
      setPendingOrder(null);
    }
    
    toast.info("Trading stopped");
  };

  // New function to simulate reaching the target price for a specific order
  const simulateTargetPriceReached = (order: PendingOrder) => {
    // Check if it's the real pending order or a mocked one
    const isRealOrder = pendingOrder && order.id === pendingOrder.id;
    
    // For the real pending order, use the existing logic
    if (isRealOrder && pendingOrder) {
      // First, set the current price to the target price to simulate reaching it
      setCurrentPrice(order.targetPrice);
      
      // Then execute the pending order using the existing logic
      executePendingOrder();
      return;
    }
    
    // For mocked orders, create a completed trade from the order
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      timestamp: Date.now(),
      pair: order.pair,
      action: order.action,
      price: order.targetPrice,
      amount: order.amount,
      total: order.targetPrice * order.amount,
      status: 'completed',
      mode: settings.mode,
    };
    
    // Add to trades
    setTrades(prev => [newTrade, ...prev]);
    
    // Update metrics
    setMetrics(prev => ({
      totalTrades: prev.totalTrades + 1,
      successfulTrades: prev.successfulTrades + 1,
      totalProfit: prev.totalProfit + (order.action === 'sell' ? newTrade.total * settings.ratePercentage / 100 : 0),
      roi: prev.roi + (order.action === 'sell' ? settings.ratePercentage : 0),
      winRate: ((prev.successfulTrades + 1) / (prev.totalTrades + 1)) * 100,
    }));
    
    toast.success(`${order.action.toUpperCase()} order executed at $${order.targetPrice.toFixed(2)}`);
  };

  // Generate a new mock price
  const generateMockPrice = (lastPrice: number) => {
    const changePercent = (Math.random() * 2 - 1) * MOCK_VOLATILITY;
    return lastPrice * (1 + changePercent);
  };

  // Fetch initial data or setup simulation
  useEffect(() => {
    // Set initial base price based on selected coin pair
    const basePrice = basePrices[settings.coinPair] || 20000;
    
    // In a real app, we would fetch the initial data from the backend
    const mockInitialPrices: PriceData[] = Array.from({ length: 20 }).map((_, index) => ({
      timestamp: Date.now() - (19 - index) * 60000,
      price: basePrice * (1 + ((Math.random() * 2 - 1) * 0.1))
    }));
    
    setPriceHistory(mockInitialPrices);
    setCurrentPrice(mockInitialPrices[mockInitialPrices.length - 1].price);
  }, [settings.coinPair]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPrice) {
        const newPrice = generateMockPrice(currentPrice);
        setCurrentPrice(newPrice);
        
        const newPriceData: PriceData = {
          timestamp: Date.now(),
          price: newPrice
        };
        
        setPriceHistory(prev => {
          const updated = [...prev, newPriceData];
          // Keep only the last 100 price points
          if (updated.length > 100) {
            return updated.slice(-100);
          }
          return updated;
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentPrice]);

  // Trading logic - check if pending orders should be executed
  useEffect(() => {
    if (!settings.isActive || !currentPrice) return;
    
    // In simulation mode, check if we should execute pending orders
    if (settings.mode === 'simulation') {
      checkPendingOrder();
    }
  }, [settings.isActive, currentPrice, pendingOrder]);

  return (
    <TradingContext.Provider
      value={{
        settings,
        updateSettings,
        trades,
        pendingOrder,
        currentPrice,
        targetPrice,
        priceHistory,
        isLoading,
        startTrading,
        stopTrading,
        toggleMode,
        balance,
        metrics,
        simulateTargetPriceReached,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

// Hook for using the Trading context
export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
