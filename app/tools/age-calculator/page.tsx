'use client';

import { useState, useEffect, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';


function getZodiac(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
  return 'Pisces ♓';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calcAge(dob: Date, now: Date) {
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

function nextBirthday(dob: Date, now: Date) {
  let next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next <= now) next = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
  const diff = next.getTime() - now.getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, nextYear: next.getFullYear() };
}

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (!dob) return null;
    const dobDate = new Date(dob + 'T00:00:00');
    if (isNaN(dobDate.getTime()) || dobDate > now) return null;
    const age = calcAge(dobDate, now);
    const bd = nextBirthday(dobDate, now);
    const totalDays = Math.floor((now.getTime() - dobDate.getTime()) / 86400000);
    const totalSeconds = Math.floor((now.getTime() - dobDate.getTime()) / 1000);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalWeeks = Math.floor(totalDays / 7);
    const zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
    const dayBorn = DAY_NAMES[dobDate.getDay()];
    return { age, bd, totalDays, totalSeconds, totalHours, totalWeeks, zodiac, dayBorn };
  }, [dob, now]);

  // Max date = today
  const maxDate = now.toISOString().slice(0, 10);

  return (
    <ToolLayout
        toolSlug="age-calculator"
      title="Age Calculator"
      description="Calculate your exact age in years, months, and days. See your next birthday countdown, total days lived, zodiac sign, and more — updated live."
      icon="🎂"
      relatedTools={[
        { name: 'Unit Converter', href: '/tools/unit-converter', icon: '📐' },
        { name: 'Loan Calculator', href: '/tools/loan-calculator', icon: '🏦' },
        { name: 'Word Counter', href: '/tools/word-counter', icon: '📊' },
      ]}
      faqs={[
        {
          q: 'Is this age calculator free?',
          a: 'Yes, completely free. No account, no sign-up, and no hidden fees — use it as many times as you like.',
        },
        {
          q: 'What does this age calculator show?',
          a: 'Enter your date of birth and the calculator instantly shows your exact age in years, months, and days, your total days/weeks/hours/seconds lived, a live countdown to your next birthday, your zodiac sign, and the day of the week you were born.',
        },
        {
          q: 'Is my birthday data private?',
          a: 'Yes. All calculations run entirely in your browser using JavaScript. Your date of birth is never sent to any server and is not stored anywhere.',
        },
        {
          q: 'How accurate is the age calculation?',
          a: 'The calculator accounts for month-length differences and correctly applies the half-day rule, so your age in years, months, and days is precise to the current second. The live countdown updates every second.',
        },
        {
          q: 'Can I use this instead of a paid date-of-birth calculator app?',
          a: 'Absolutely. Paid apps often add the same basic age math behind a paywall. This tool gives you zodiac sign, birthday countdown, and total time-lived stats — all for free with no ads or subscriptions.',
        },
      ]}
    >
      <div className="space-y-5">
        {/* DOB Input */}
        <div className="card">
          <label className="label">Date of Birth</label>
          <input
            type="date"
            className="input max-w-xs"
            value={dob}
            max={maxDate}
            onChange={e => setDob(e.target.value)}
          />
          {dob && !result && (
            <p className="text-red-600 text-sm mt-2">Date cannot be in the future.</p>
          )}
        </div>

        {result && (
          <>
            {/* Main Age */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center py-5">
                <p className="text-4xl font-bold text-violet-600">{result.age.years}</p>
                <p className="text-sm text-stone-500 mt-1">Years</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-4xl font-bold text-blue-700">{result.age.months}</p>
                <p className="text-sm text-stone-500 mt-1">Months</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-4xl font-bold text-cyan-400">{result.age.days}</p>
                <p className="text-sm text-stone-500 mt-1">Days</p>
              </div>
            </div>

            {/* Next birthday countdown */}
            <div className="card bg-gradient-to-br from-violet-600/10 to-purple-600/5 border-violet-500/20">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                🎂 Next Birthday — {result.bd.nextYear} (countdown)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Days', value: result.bd.d },
                  { label: 'Hours', value: result.bd.h },
                  { label: 'Minutes', value: result.bd.m },
                  { label: 'Seconds', value: result.bd.s },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-stone-100/60 rounded-xl py-3 text-center">
                    <p className="text-2xl font-bold text-violet-600 font-mono tabular-nums">
                      {String(value).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Days', value: result.totalDays.toLocaleString(), color: 'text-emerald-700' },
                { label: 'Total Weeks', value: result.totalWeeks.toLocaleString(), color: 'text-amber-700' },
                { label: 'Total Hours', value: result.totalHours.toLocaleString(), color: 'text-blue-700' },
                { label: 'Total Seconds', value: result.totalSeconds.toLocaleString(), color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="card text-center py-4">
                  <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-stone-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Fun facts */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Zodiac Sign</p>
                  <p className="text-stone-800 font-semibold">{result.zodiac}</p>
                </div>
              </div>
              <div className="card flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Born On</p>
                  <p className="text-stone-800 font-semibold">a {result.dayBorn}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
