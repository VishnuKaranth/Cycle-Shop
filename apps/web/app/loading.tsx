import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
      <h2 className="text-xl font-bold uppercase tracking-widest text-foreground">Loading</h2>
      <p className="text-muted-foreground mt-2">Preparing your ride...</p>
    </div>
  );
}
