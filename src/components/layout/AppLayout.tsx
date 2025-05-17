
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Home, Settings, BarChart, History, TrendingUp } from "lucide-react";
import { NavLink, Outlet } from 'react-router-dom';
import { useTrading } from '@/contexts/TradingContext';
import { cn } from '@/lib/utils';

const AppLayout: React.FC = () => {
  const { settings } = useTrading();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-2">
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Binance AutoTrader</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full w-fit", 
                  settings.mode === 'simulation' 
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-green-500/20 text-green-300"
                )}>
                  {settings.mode === 'simulation' ? 'Simulation' : 'Live'} Mode
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/" className={({ isActive }) => 
                        cn(isActive ? "text-primary bg-secondary/50" : "")
                      }>
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/history" className={({ isActive }) => 
                        cn(isActive ? "text-primary bg-secondary/50" : "")
                      }>
                        <History className="h-5 w-5" />
                        <span>Trade History</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/analytics" className={({ isActive }) => 
                        cn(isActive ? "text-primary bg-secondary/50" : "")
                      }>
                        <BarChart className="h-5 w-5" />
                        <span>Analytics</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/settings" className={({ isActive }) => 
                        cn(isActive ? "text-primary bg-secondary/50" : "")
                      }>
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Market</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/market" className={({ isActive }) => 
                        cn(isActive ? "text-primary bg-secondary/50" : "")
                      }>
                        <TrendingUp className="h-5 w-5" />
                        <span>Live Market</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-3 py-2">
              <div className="text-xs text-muted-foreground">
                Trading Pair: <span className="font-medium text-foreground">{settings.coinPair}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[60px] border-b flex items-center px-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold ml-4">Binance AutoTrader</h1>
          </div>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
