'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  day_pass: 'Day Pass',
  pro: 'Pro',
  unlimited: 'Unlimited',
};

export function SidebarUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? '');
    });

    fetch('/api/user/usage')
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});

    supabase.from('profiles').select('name').single().then(({ data }) => {
      if (data?.name) setName(data.name);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const initial = (name || email || 'U')[0].toUpperCase();
  const planLabel = PLAN_LABEL[plan] ?? plan;
  const isPaid = plan !== 'free';

  return (
    <div className="p-4 border-t border-gray-800 space-y-3">
      {!isPaid && (
        <Link href="/pricing" className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all">
          Upgrade to Pro →
        </Link>
      )}
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{name || email || 'Loading…'}</p>
          <p className="text-xs text-gray-500">{planLabel} Plan</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
