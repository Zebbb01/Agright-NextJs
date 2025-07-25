// src/components/ui/spinner.tsx
import { cn } from "@/lib/utils"; // Assuming you have a utility for class merging (from shadcn/ui)
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}