'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, AlertCircle, Check, CreditCard, Shield, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SubInfo {
  created_at: string | null;
  current_period_end: string | null;
  status: string | null;
  dodo_payment_id: string | null;
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  day_pass: 'Day Pass',
  pro: 'Pro',
  unlimited: 'Unlimited',
};

const PLAN_DESC: Record<string, string> = {
  free: '5–10 uses/day · No credit card required',
  day_pass: '200 uses for 24 hours · One-time purchase',
  pro: '200 uses/day · Priority processing',
  unlimited: 'Unlimited uses · All features',
};

const REFUND_WINDOW_DAYS = 7;

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundResult, setRefundResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);

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

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('created_at, current_period_end, status, dodo_payment_id')
        .eq('user_id', user.id)
        .single();

      setSub(subData ?? null);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const purchasedAt = sub?.created_at ? new Date(sub.created_at) : null;
  const daysSince = purchasedAt ? (Date.now() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24) : 999;
  const isRefundEligible =
    plan !== 'free' &&
    sub !== null &&
    sub.status !== 'refunded' &&
    sub.status !== 'refund_requested' &&
    daysSince <= REFUND_WINDOW_DAYS;
  const daysLeft = Math.max(0, REFUND_WINDOW_DAYS - Math.floor(daysSince));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
    if (error) {
      setError('Failed to save changes.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel? You'll keep access until the end of the billing period.")) return;
    setCancelLoading(true);
    try {
      const res = await fetch('/api/payments/cancel-subscription', { method: 'POST' });
      if (res.ok) {
        setPlan('free');
        alert("Subscription cancelled. You'll keep access until the end of the billing period.");
      } else {
        alert('Failed to cancel. Please contact support@formly.tools');
      }
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleRefundRequest(e: React.FormEvent) {
    e.preventDefault();
    setRefundLoading(true);
    setRefundResult(null);
    try {
      const res = await fetch('/api/payments/request-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRefundResult({ type: 'error', message: data.error ?? 'Refund request failed.' });
      } else {
        setRefundResult({ type: 'success', message: data.message });
        setPlan('free');
        setShowRefundForm(false);
      }
    } catch {
      setRefundResult({ type: 'error', message: 'Network error. Please contact support@formly.tools.' });
    } finally {
      setRefundLoading(false);
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
            <p className="text-sm font-medium text-white">{PLAN_LABEL[plan] ?? plan} Plan</p>
            <p className="text-xs text-gray-500 mt-0.5">{PLAN_DESC[plan] ?? ''}</p>
            {plan === 'day_pass' && sub?.current_period_end && (
              <p className="text-xs text-amber-400 mt-1">
                Expires {new Date(sub.current_period_end).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            {plan !== 'free' && plan !== 'day_pass' && sub?.current_period_end && (
              <p className="text-xs text-gray-600 mt-1">
                Renews {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          {plan === 'free' ? (
            <Link href="/pricing" className="btn-primary py-2 px-4 text-sm">
              Upgrade Plan
            </Link>
          ) : plan !== 'day_pass' ? (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="btn-secondary py-2 px-4 text-sm text-red-400 border-red-400/20 hover:bg-red-400/10"
            >
              {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Cancel Subscription
            </button>
          ) : null}
        </div>
        <p className="text-xs text-gray-600">
          For billing issues, email{' '}
          <a href="mailto:support@formly.tools" className="text-violet-400 hover:underline">support@formly.tools</a>.
          7-day money-back guarantee on all plans.
        </p>
      </div>

      {/* Refund */}
      {plan !== 'free' && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-violet-400" />
            Refund
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            7-day money-back guarantee. No questions asked within {REFUND_WINDOW_DAYS} days of purchase.
          </p>

          {refundResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-sm border ${
              refundResult.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {refundResult.type === 'success'
                ? <Check className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {refundResult.message}
            </div>
          )}

          {sub?.status === 'refunded' && (
            <p className="text-sm text-gray-400">This subscription has been refunded.</p>
          )}

          {sub?.status === 'refund_requested' && (
            <p className="text-sm text-amber-400">
              Refund is being processed. Our team will email you within 24–48 hours.
            </p>
          )}

          {sub?.status !== 'refunded' && sub?.status !== 'refund_requested' && !refundResult && (
            isRefundEligible ? (
              <>
                <p className="text-xs text-emerald-400 mb-3">
                  ✓ Eligible for refund · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in window
                </p>
                {!showRefundForm ? (
                  <button onClick={() => setShowRefundForm(true)} className="btn-secondary py-2 px-4 text-sm">
                    Request Refund
                  </button>
                ) : (
                  <form onSubmit={handleRefundRequest} className="space-y-3">
                    <div>
                      <label className="label text-xs">Reason (optional)</label>
                      <textarea
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                        placeholder="Let us know why — helps us improve."
                        rows={3}
                        className="input text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={refundLoading}
                        className="btn-secondary py-2 px-4 text-sm !text-red-400 !border-red-400/30 hover:!bg-red-400/10"
                      >
                        {refundLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Confirm Refund
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRefundForm(false)}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Your plan will be downgraded to Free immediately. Amount returns to your original payment method within 5–7 business days.
                    </p>
                  </form>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                {daysSince > REFUND_WINDOW_DAYS
                  ? <>Refund window has passed ({Math.floor(daysSince)} days since purchase). <a href="mailto:support@formly.tools" className="text-violet-400 hover:underline">Contact support</a> for assistance.</>
                  : 'No active subscription found for refund.'}
              </p>
            )
          )}
        </div>
      )}

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
