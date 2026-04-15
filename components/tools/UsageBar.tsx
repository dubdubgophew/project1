'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface UsageBarProps {
  used: number;
  limit: number;
  plan: string;
}

export function UsageBar({ used, limit, plan }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  if (plan === 'unlimited') return null;

  return (
    <div className={`p-3 rounded-xl border text-sm ${isAtLimit ? 'bg-red-500/10 border-red-500/20' : isNearLimit ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gray-800/50 border-gray-700'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-gray-300'}`}>
          {isAtLimit ? (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Daily limit reached
            </span>
          ) : (
            `${used} / ${limit} uses today`
          )}
        </span>
        <span className="text-xs text-gray-500 capitalize">{plan} plan</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-violet-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="mt-2 text-xs text-gray-400">
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300 font-medium">
            Upgrade to Pro
          </Link>
          {' '}for 200 uses/day, or wait until midnight UTC for reset.
        </p>
      )}
    </div>
  );
}
