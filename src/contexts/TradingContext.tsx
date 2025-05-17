import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Types
export type TradingMode = 'simulation' | 'live';
export type CoinPair = string;
export type TradingAction = 'buy' | 'sell';

export interface Trade {
  id: string;
  timestamp: number;
  pair: string;
  action: TradingAction;
  price: number;
  amount: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  mode: TradingMode;
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
  currentPrice: number | null;
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
}

// Mock data for simulation mode
const MOCK_PRICE_SEED = 20000; // Base price for BTC/USDT
const MOCK_VOLATILITY = 0.005; // 0.5% price movement per update

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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(MOCK_PRICE_SEED);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState({ base: 1, quote: 20000 }); // 1 BTC, 20000 USDT
  const [metrics, setMetrics] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    roi: 0,
    winRate: 0,
  });

  // Function to update settings
  const updateSettings = (newSettings: Partial<TradingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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

  // Start trading
  const startTrading = () => {
    if (settings.isActive) return;
    
    updateSettings({ isActive: true });
    toast.success("Trading started");
  };

  // Stop trading
  const stopTrading = () => {
    if (!settings.isActive) return;
    
    updateSettings({ isActive: false });
    toast.info("Trading stopped");
  };

  // Generate a new mock price
  const generateMockPrice = (lastPrice: number) => {
    const changePercent = (Math.random() * 2 - 1) * MOCK_VOLATILITY;
    return lastPrice * (1 + changePercent);
  };

  // Create a mock trade based on current price and settings
  const createMockTrade = () => {
    if (!currentPrice) return;
    
    const action = settings.lastAction === 'buy' ? 'sell' : 'buy';
    const price = currentPrice;
    const amount = settings.amount;
    const total = price * amount;
    
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      timestamp: Date.now(),
      pair: settings.coinPair,
      action,
      price,
      amount,
      total,
      status: 'completed',
      mode: settings.mode,
    };
    
    setTrades(prev => [newTrade, ...prev]);
    updateSettings({ lastAction: action });
    
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
    
    toast.success(`${action.toUpperCase()} order executed at $${price.toFixed(2)}`);
  };

  // Fetch initial data or setup simulation
  useEffect(() => {
    // In a real app, we would fetch the initial data from the backend
    const mockInitialPrices: PriceData[] = Array.from({ length: 20 }).map((_, index) => ({
      timestamp: Date.now() - (19 - index) * 60000,
      price: MOCK_PRICE_SEED * (1 + ((Math.random() * 2 - 1) * 0.1))
    }));
    
    setPriceHistory(mockInitialPrices);
    setCurrentPrice(mockInitialPrices[mockInitialPrices.length - 1].price);
  }, []);

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

  // Trading logic
  useEffect(() => {
    if (!settings.isActive || !currentPrice) return;
    
    // In simulation mode, check if we should execute a trade based on price movement
    if (settings.mode === 'simulation') {
      // Simple logic: if price moved by ratePercentage since last action, execute a trade
      const lastTrade = trades[0];
      
      if (!lastTrade || priceHistory.length < 2) return;
      
      const priceChange = (currentPrice - lastTrade.price) / lastTrade.price * 100;
      
      if (
        (settings.lastAction === 'buy' && priceChange >= settings.ratePercentage) || 
        (settings.lastAction === 'sell' && priceChange <= -settings.ratePercentage)
      ) {
        createMockTrade();
      }
    }
  }, [settings.isActive, currentPrice, priceHistory, settings.lastAction, settings.ratePercentage]);

  return (
    <TradingContext.Provider
      value={{
        settings,
        updateSettings,
        trades,
        currentPrice,
        priceHistory,
        isLoading,
        startTrading,
        stopTrading,
        toggleMode,
        balance,
        metrics,
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
