import { Shield, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] flex-1">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <Loader2 className="absolute -inset-2 w-20 h-20 text-primary/40 animate-spin" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <h2 className="text-xl font-bold tracking-tight">SecureMed</h2>
          <p className="text-sm text-muted-foreground animate-pulse">Loading SecureMed...</p>
        </div>
      </div>
    </div>
  );
}
