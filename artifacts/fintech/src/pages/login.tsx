import * as React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync({ data });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error?.response?.data?.error || "Invalid credentials",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 lg:block overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="FinTech Background" 
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <h1 className="font-display text-4xl font-bold leading-tight text-white mb-4">
            Master your wealth with <br/><span className="text-primary">intelligent insights.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Join thousands managing their expenses, growing their savings, and investing smarter.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-12 h-12 mb-6 mx-auto lg:mx-0 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <Input
                {...register("email")}
                type="email"
                placeholder="Email address"
                icon={<Mail className="h-5 w-5" />}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                icon={<Lock className="h-5 w-5" />}
                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending}>
              Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="font-medium text-primary hover:underline cursor-pointer">Sign up</span>
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
