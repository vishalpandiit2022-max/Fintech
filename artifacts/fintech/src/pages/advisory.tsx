import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, BrainCircuit, Activity } from "lucide-react";
import { useGetExpenses, useGetMe } from "@workspace/api-client-react";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string | React.ReactNode;
}

export default function InvestmentAdvisory() {
  const { data: user } = useGetMe();
  const { data: expenses } = useGetExpenses();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const handleAnalyze = () => {
    if (!user || !expenses) return;
    
    setIsTyping(true);
    const salary = user.monthlySalary;
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const rate = salary > 0 ? ((salary - totalExp) / salary) * 100 : 0;
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: (
          <div className="space-y-3">
            <p>I've analyzed your current financial profile:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your savings rate is <strong>{rate.toFixed(1)}%</strong>.</li>
              {rate < 20 ? (
                <li className="text-warning">This is below the recommended 20% threshold. Consider cutting back on discretionary spending.</li>
              ) : (
                <li className="text-success">Excellent! You have a healthy surplus.</li>
              )}
              <li>Based on typical Indian markets, investing your monthly surplus in a Nifty 50 Index Fund could yield ~12% annually.</li>
            </ul>
          </div>
        )
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "That's a great question. While I'm a simulated demo right now, generally diversifying across equity (mutual funds) and debt (PPF/FDs) is recommended to manage risk while beating inflation. Always maintain an emergency fund of 6 months expenses first."
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-display font-bold flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="h-8 w-8 text-primary" /> AI Financial Advisory
            </h1>
            <p className="text-muted-foreground mt-2">Get personalized insights and investment strategies based on your data.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card className="border-primary/20 bg-gradient-to-b from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Quick Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Let AI analyze your linked expenses and salary to provide immediate actionable advice.
                  </p>
                  <Button onClick={handleAnalyze} className="w-full shadow-lg shadow-primary/20" variant="default">
                    Analyze My Spending
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-secondary/20">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-2">Suggested Questions</h4>
                  <ul className="space-y-2 text-sm text-primary cursor-pointer">
                    <li onClick={() => setInput("How much should I keep in emergency fund?")} className="hover:underline">→ How much for emergency fund?</li>
                    <li onClick={() => setInput("What are good tax saving options under 80C?")} className="hover:underline">→ Tax saving options (80C)?</li>
                    <li onClick={() => setInput("Should I pay off debt or invest?")} className="hover:underline">→ Pay debt vs Invest?</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 flex flex-col h-[600px]">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/30 py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" /> WealthBot
                  </CardTitle>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                      <BrainCircuit className="h-12 w-12 mb-4" />
                      <p>Send a message to start advisory session</p>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-secondary rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border/50 bg-card">
                  <form onSubmit={handleChat} className="flex gap-2">
                    <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about investing, saving, or your spending..." 
                      className="flex-1 rounded-full bg-secondary/50"
                    />
                    <Button type="submit" size="icon" className="rounded-full shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
