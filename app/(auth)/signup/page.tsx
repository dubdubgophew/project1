'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Loader2, Eye, EyeOff, Check } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? 'free';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, plan },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?plan=${plan}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?plan=${plan}` },
    });
  }

  if (success) {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
        <p className="text-gray-400 text-sm">
          We sent a confirmation link to <strong className="text-white">{email}</strong>.
          Click it to activate your account and start using Formly free.
        </p>
        <p className="text-xs text-gray-600 mt-4">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      {plan !== 'free' && (
        <div className="mb-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center text-sm text-violet-300">
          You&apos;re signing up for the <strong className="text-violet-200 capitalize">{plan}</strong> plan.
          You&apos;ll be redirected to payment after signup.
        </div>
      )}

      <h1 className="text-2xl font-bold text-white text-center mb-1">Create your account</h1>
      <p className="text-gray-400 text-center text-sm mb-8">
        Free forever · No credit card for free plan
      </p>

      <button
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="btn-secondary w-full justify-center mb-4"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Sign up with Google
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">or with email</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4" aria-label="Create account form">
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="signup-name" className="label">Full Name</label>
          <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required aria-required="true" className="input" />
        </div>
        <div>
          <label htmlFor="signup-email" className="label">Email</label>
          <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required aria-required="true" className="input" />
        </div>
        <div>
          <label htmlFor="signup-password" className="label">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              aria-required="true"
              minLength={8}
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {loading ? 'Creating account…' : 'Create Free Account'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-600 mt-4">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link>{' '}
        &amp;{' '}
        <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="card animate-pulse h-96" />}>
      <SignupForm />
    </Suspense>
  );
}
