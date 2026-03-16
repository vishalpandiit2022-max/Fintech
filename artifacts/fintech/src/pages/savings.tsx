import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useGetSavingsGoals, useCreateSavingsGoal, useDeleteSavingsGoal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, Plus, Trash2, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const goalSchema = z.object({
  goalName: z.string().min(2, "Name required"),
  targetAmount: z.coerce.number().min(1000, "Min amount is 1000"),
  months: z.coerce.number().min(1).max(60),
});

type GoalForm = z.infer<typeof goalSchema>;

export default function SavingsGoals() {
  const { data: goals, isLoading } = useGetSavingsGoals();
  const createMutation = useCreateSavingsGoal();
  const deleteMutation = useDeleteSavingsGoal();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: { months: 12 }
  });

  const watchTarget = watch("targetAmount");
  const watchMonths = watch("months");
  const requiredMonthly = (watchTarget && watchMonths) ? watchTarget / watchMonths : 0;

  const onSubmit = async (data: GoalForm) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      setIsAddOpen(false);
      reset();
      toast({ title: "Goal created successfully" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to create goal" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      toast({ title: "Goal deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete goal" });
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Savings Goals</h1>
              <p className="text-muted-foreground mt-1">Plan for your future purchases and milestones.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Goal
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {isLoading && <div className="col-span-full text-center py-10">Loading goals...</div>}
              {goals?.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                          <Target className="h-6 w-6" />
                        </div>
                        <button 
                          onClick={() => handleDelete(goal.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <CardTitle>{goal.goalName}</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Target Amount</span>
                          <span className="font-semibold">{formatINR(goal.targetAmount)}</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          {/* Mocking progress as 0 for now since API doesn't track current savings per goal */}
                          <div className="h-full bg-primary w-0 rounded-full" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {goal.months} Months
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Required Monthly</p>
                          <p className="font-mono font-medium text-primary">
                            {formatINR(goal.targetAmount / goal.months)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!isLoading && goals?.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-border/50 border-dashed">
                <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No active goals</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Create a savings goal to start tracking.</p>
                <Button variant="outline" onClick={() => setIsAddOpen(true)}>Create First Goal</Button>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Name</label>
              <Input {...register("goalName")} placeholder="e.g. New Car, Vacation" />
              {errors.goalName && <span className="text-xs text-destructive">{errors.goalName.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount (₹)</label>
              <Input type="number" step="1000" {...register("targetAmount")} placeholder="10000" />
              {errors.targetAmount && <span className="text-xs text-destructive">{errors.targetAmount.message}</span>}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Timeframe</label>
                <span className="text-sm font-mono text-primary">{watchMonths || 12} Months</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="60" 
                {...register("months")}
                className="w-full accent-primary"
              />
              {errors.months && <span className="text-xs text-destructive">{errors.months.message}</span>}
            </div>

            {requiredMonthly > 0 && (
              <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between border border-primary/20">
                <span className="text-sm font-medium text-primary">Monthly Target</span>
                <span className="font-mono font-bold text-primary">{formatINR(requiredMonthly)}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Create Goal</Button>
            </div>
          </form>
        </Dialog>
      </AppLayout>
    </AuthGuard>
  );
}
