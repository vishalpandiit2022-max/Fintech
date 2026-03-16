import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Menu,
  X,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/savings-goals", label: "Savings Goals", icon: Target },
  { href: "/investment-advisory", label: "AI Advisory", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.clear();
    setLocation("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0",
        isMobileMenuOpen ? "flex translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 items-center px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">FinTech</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto rounded-md p-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "group relative flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn("relative z-10 h-5 w-5", isActive ? "text-primary" : "group-hover:text-foreground")} />
                    <span className="relative z-10">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl sm:px-8 lg:px-12">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden flex-1 sm:flex lg:ml-0 lg:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search transactions, goals..." 
                className="h-10 w-full rounded-full border border-border/50 bg-secondary/30 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:bg-secondary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground mt-1">Premium Member</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent font-bold text-primary-foreground shadow-lg">
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
