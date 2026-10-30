import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading PlacePilot data...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm mb-4">
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
};
