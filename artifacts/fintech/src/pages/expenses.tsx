import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useGetExpenses, useCreateExpense, useDeleteExpense } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, ReceiptText, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

const expenseSchema = z.object({
  description: z.string().min(2, "Description required"),
  category: z.string().min(1, "Category required"),
  amount: z.coerce.number().min(1, "Amount must be > 0"),
  date: z.string().min(1, "Date required"),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function Expenses() {
  const { data: expenses, isLoading } = useGetExpenses();
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultDate: { date: new Date().toISOString().split('T')[0] }
  });

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const onSubmit = async (data: ExpenseForm) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsAddOpen(false);
      reset();
      toast({ title: "Expense added successfully" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to add expense" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Expense deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete expense" });
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Expense Tracker</h1>
              <p className="text-muted-foreground mt-1">Manage and track your daily spending.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>

          <Card className="bg-secondary/20 border-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-display font-bold text-destructive">{formatINR(total)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ReceiptText className="h-6 w-6 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-secondary/30 text-sm font-medium text-muted-foreground">
              <div className="col-span-5 sm:col-span-4">Description</div>
              <div className="hidden sm:block sm:col-span-3">Category</div>
              <div className="col-span-4 sm:col-span-3">Date</div>
              <div className="col-span-3 sm:col-span-2 text-right">Amount</div>
            </div>

            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {isLoading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
                {expenses?.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">No expenses recorded yet.</div>
                )}
                {expenses?.map((expense) => (
                  <motion.div 
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/20 transition-colors group"
                  >
                    <div className="col-span-5 sm:col-span-4 font-medium truncate pr-2">
                      {expense.description}
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">{expense.category}</div>
                    </div>
                    <div className="hidden sm:block sm:col-span-3">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                        {expense.category}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-sm text-muted-foreground">
                      {format(parseISO(expense.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                      <span className="font-mono">{formatINR(expense.amount)}</span>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new transaction to track your spending.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input {...register("description")} placeholder="Coffee, Rent, etc." />
              {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select 
                {...register("category")}
                className="flex h-12 w-full rounded-xl border border-input bg-secondary/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="text-xs text-destructive">{errors.category.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input type="number" {...register("amount")} placeholder="0.00" />
                {errors.amount && <span className="text-xs text-destructive">{errors.amount.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" {...register("date")} />
                {errors.date && <span className="text-xs text-destructive">{errors.date.message}</span>}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Save Expense</Button>
            </div>
          </form>
        </Dialog>

      </AppLayout>
    </AuthGuard>
  );
}
