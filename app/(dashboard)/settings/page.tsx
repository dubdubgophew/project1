'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, AlertCircle, Check, CreditCard, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, plan')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.name ?? '');
        setPlan(profile.plan ?? 'free');
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id);

    if (error) {
      setError('Failed to save changes.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleCancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll keep access until the end of the billing period.')) return;

    setCancelLoading(true);
    try {
      const res = await fetch('/api/payments/cancel-subscription', { method: 'POST' });
      if (res.ok) {
        setPlan('free');
        alert('Subscription cancelled. You\'ll keep access until the end of the billing period.');
      } else {
        alert('Failed to cancel. Please contact support@formly.tools');
      }
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Profile */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-400" />
          Profile
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed here.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-400" />
          Subscription
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-white capitalize">{plan} Plan</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {plan === 'free'
                ? '5 uses/day · No credit card required'
                : plan === 'pro'
                ? '200 uses/day · Priority processing'
                : 'Unlimited uses · All features'}
            </p>
          </div>
          {plan === 'free' ? (
            <Link href="/pricing" className="btn-primary py-2 px-4 text-sm">
              Upgrade Plan
            </Link>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="btn-secondary py-2 px-4 text-sm text-red-400 border-red-400/20 hover:bg-red-400/10"
            >
              {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Cancel Subscription
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600">
          For billing issues, email <a href="mailto:support@formly.tools" className="text-violet-400 hover:underline">support@formly.tools</a>.
          7-day money-back guarantee.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-red-500/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Danger Zone
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-300">Sign out of your account</p>
            <p className="text-xs text-gray-600 mt-0.5">You can sign back in anytime.</p>
          </div>
          <button onClick={handleSignOut} className="btn-secondary py-2 px-4 text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
