import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe, useUpdateSalary } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Mail, Wallet, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/utils";

export default function Profile() {
  const { data: user } = useGetMe();
  const updateSalaryMutation = useUpdateSalary();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [salaryInput, setSalaryInput] = React.useState("");

  React.useEffect(() => {
    if (user && !isEditing) {
      setSalaryInput(user.monthlySalary.toString());
    }
  }, [user, isEditing]);

  const handleSaveSalary = async () => {
    const val = parseFloat(salaryInput);
    if (isNaN(val) || val <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount" });
      return;
    }

    try {
      await updateSalaryMutation.mutateAsync({ data: { monthlySalary: val } });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({ title: "Salary updated successfully" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to update salary" });
    }
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8 max-w-3xl">
          <div>
            <h1 className="text-3xl font-display font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and financial baseline.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your core identity details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <ShieldCheck className="h-4 w-4 mr-1 text-success" /> Account Verified
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex h-12 items-center rounded-xl border border-border/50 bg-secondary/20 px-4 text-sm">
                    <User className="h-4 w-4 mr-3 text-muted-foreground" /> {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="flex h-12 items-center rounded-xl border border-border/50 bg-secondary/20 px-4 text-sm">
                    <Mail className="h-4 w-4 mr-3 text-muted-foreground" /> {user.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Financial Baseline
              </CardTitle>
              <CardDescription>This is used to calculate your savings rate and provide advisory insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-6 rounded-xl bg-background/50 border border-border/50">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Monthly Salary (INR)</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={salaryInput} 
                      onChange={(e) => setSalaryInput(e.target.value)}
                      className="max-w-xs text-lg font-mono"
                      autoFocus
                    />
                  ) : (
                    <div className="text-3xl font-display font-bold text-primary tracking-tight">
                      {formatINR(user.monthlySalary)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button onClick={handleSaveSalary} isLoading={updateSalaryMutation.isPending}>Save</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Salary</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
