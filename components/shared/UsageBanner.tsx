'use client';

import Link from 'next/link';
import { AlertTriangle, Zap, X } from 'lucide-react';
import { useState } from 'react';

interface UsageBannerProps {
  remaining: number;
  limit: number;
  plan: string;
}

export function UsageBanner({ remaining, limit, plan }: UsageBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const pct = remaining / limit;
  const isExhausted = remaining === 0;
  const isLow = !isExhausted && pct <= 0.2; // ≤20% left

  if (!isExhausted && !isLow) return null;

  if (isExhausted) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 relative">
        <Zap className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <span className="text-red-300 font-semibold">Daily limit reached. </span>
          {plan === 'anonymous' && (
            <span className="text-gray-400">
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 underline">Sign up free</Link> for 10 uses/day, or{' '}
              <Link href="/pricing" className="text-violet-400 hover:text-violet-300 underline">upgrade to Pro</Link> for 200/day.
            </span>
          )}
          {plan === 'free' && (
            <span className="text-gray-400">
              <Link href="/pricing" className="text-violet-400 hover:text-violet-300 underline">Upgrade to Pro</Link> for 200 uses/day, or wait for your limit to reset at midnight UTC.
            </span>
          )}
          {plan === 'pro' && (
            <span className="text-gray-400">
              <Link href="/pricing" className="text-violet-400 hover:text-violet-300 underline">Upgrade to Unlimited</Link> for unlimited uses, or wait for your limit to reset at midnight UTC.
            </span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 relative">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <span className="text-amber-300 font-medium">
          {remaining} use{remaining === 1 ? '' : 's'} left today
        </span>
        <span className="text-gray-400">
          {' '}({plan} plan · {limit}/day limit).{' '}
          {plan !== 'unlimited' && (
            <Link href="/pricing" className="text-violet-400 hover:text-violet-300 underline">
              Upgrade for more
            </Link>
          )}
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
