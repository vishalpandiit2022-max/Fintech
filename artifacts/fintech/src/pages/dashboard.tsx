import * as React from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useGetMe, useGetExpenses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { Wallet, TrendingDown, PiggyBank, Percent, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: expenses } = useGetExpenses();

  const salary = user?.monthlySalary || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const netSavings = salary - totalExpenses;
  const savingsRate = salary > 0 ? (netSavings / salary) * 100 : 0;

  const recentExpenses = expenses?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) || [];

  const statCards = [
    { title: "Monthly Salary", value: formatINR(salary), icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Expenses", value: formatINR(totalExpenses), icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
    { title: "Net Savings", value: formatINR(netSavings), icon: PiggyBank, color: "text-success", bg: "bg-success/10" },
    { title: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, icon: Percent, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Overview</h1>
              <p className="text-muted-foreground mt-1">Here's your financial summary for this month.</p>
            </div>
            <Link href="/expenses">
              <button className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] active:scale-95">
                Add New Expense
              </button>
            </Link>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {statCards.map((stat, i) => (
              <motion.div key={i} variants={item}>
                <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-display font-bold tracking-tight">{stat.value}</p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </div>
                  <Link href="/expenses">
                    <span className="text-sm text-primary hover:underline cursor-pointer flex items-center">
                      View all <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentExpenses.length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                              <ReceiptIcon category={expense.category} />
                            </div>
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <span className="bg-secondary px-2 py-0.5 rounded-full mr-2">{expense.category}</span>
                                {format(parseISO(expense.date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold font-mono text-destructive">
                            -{formatINR(expense.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                        <TrendingDown className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg">No expenses yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">Start tracking your spending today.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/20 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">
                      Based on your current trajectory, your savings rate of <strong className="text-foreground">{savingsRate.toFixed(1)}%</strong> is {savingsRate > 20 ? 'excellent' : 'below recommended levels'}. 
                    </p>
                    {savingsRate < 20 && (
                      <div className="bg-destructive/10 text-destructive-foreground text-sm p-4 rounded-xl border border-destructive/20">
                        Try reducing <strong>Shopping</strong> expenses to boost your rate above 20%.
                      </div>
                    )}
                    {savingsRate >= 20 && (
                      <div className="bg-success/10 text-success text-sm p-4 rounded-xl border border-success/20">
                        Great job! Consider investing your surplus into index funds for long-term growth.
                      </div>
                    )}
                    
                    <Link href="/investment-advisory">
                      <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-secondary/80 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
                        Ask AI Advisor <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}

// Helper component
function ReceiptIcon({ category }: { category: string }) {
  // simple mapping
  return <TrendingDown className="h-5 w-5" />;
}
