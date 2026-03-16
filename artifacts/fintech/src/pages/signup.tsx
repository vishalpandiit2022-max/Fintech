import * as React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Wallet, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  monthlySalary: z.coerce.number().min(1, "Please enter your monthly salary"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await signupMutation.mutateAsync({ data });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error?.response?.data?.error || "Could not create account",
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
            Take control of your <br/><span className="text-primary">financial future.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Setup your profile in minutes and start tracking your wealth journey today.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 relative z-10 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-12 h-12 mb-6 mx-auto lg:mx-0 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Create an account</h2>
            <p className="text-muted-foreground">Let's get started with your basic info</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input
                {...register("name")}
                type="text"
                placeholder="Full Name"
                icon={<User className="h-5 w-5" />}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Input
                {...register("email")}
                type="email"
                placeholder="Email address"
                icon={<Mail className="h-5 w-5" />}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                icon={<Lock className="h-5 w-5" />}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Input
                {...register("monthlySalary")}
                type="number"
                placeholder="Monthly Salary (₹)"
                icon={<Wallet className="h-5 w-5" />}
                className={errors.monthlySalary ? "border-destructive" : ""}
              />
              {errors.monthlySalary && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.monthlySalary.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-4" size="lg" isLoading={signupMutation.isPending}>
              Create Account
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link href="/login">
                <span className="font-medium text-primary hover:underline cursor-pointer">Sign in</span>
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
