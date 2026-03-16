import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-4">
      <ShieldAlert className="h-20 w-20 text-muted-foreground mb-6 opacity-50" />
      <h1 className="font-display text-4xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The financial page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button size="lg" className="rounded-full px-8">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
