'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Plus, Trash2, Calculator } from 'lucide-react';


interface Person { id: string; name: string }
interface Expense { id: string; desc: string; amount: number; paidBy: string; splitBetween: string[] }
interface Settlement { from: string; to: string; amount: number }

function simplifyDebts(balances: Record<string, number>): Settlement[] {
  const pos: { name: string; amt: number }[] = [];
  const neg: { name: string; amt: number }[] = [];
  Object.entries(balances).forEach(([name, amt]) => {
    if (amt > 0.005) pos.push({ name, amt });
    else if (amt < -0.005) neg.push({ name, amt: Math.abs(amt) });
  });
  const settlements: Settlement[] = [];
  let i = 0, j = 0;
  while (i < pos.length && j < neg.length) {
    const p = pos[i], n = neg[j];
    const amount = Math.min(p.amt, n.amt);
    settlements.push({ from: n.name, to: p.name, amount: Math.round(amount * 100) / 100 });
    p.amt -= amount;
    n.amt -= amount;
    if (p.amt < 0.005) i++;
    if (n.amt < 0.005) j++;
  }
  return settlements;
}

export default function ExpenseSplitterPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPaidBy, setNewPaidBy] = useState('');
  const [newSplit, setNewSplit] = useState<string[]>([]);
  const [settlements, setSettlements] = useState<Settlement[] | null>(null);
  const [totals, setTotals] = useState<Record<string, number> | null>(null);

  const addPerson = useCallback(() => {
    const name = newName.trim();
    if (!name || people.find(p => p.name === name)) return;
    const person = { id: crypto.randomUUID(), name };
    setPeople(prev => [...prev, person]);
    setNewName('');
    if (!newPaidBy) setNewPaidBy(name);
    setNewSplit(prev => [...prev, name]);
  }, [newName, people, newPaidBy]);

  const removePerson = (id: string) => {
    const p = people.find(x => x.id === id);
    if (!p) return;
    setPeople(prev => prev.filter(x => x.id !== id));
    setExpenses(prev => prev.filter(e => e.paidBy !== p.name));
    setSettlements(null);
    setTotals(null);
  };

  const addExpense = useCallback(() => {
    if (!newDesc.trim() || !newAmount || !newPaidBy || newSplit.length === 0) return;
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) return;
    setExpenses(prev => [...prev, {
      id: crypto.randomUUID(),
      desc: newDesc.trim(),
      amount: amt,
      paidBy: newPaidBy,
      splitBetween: [...newSplit],
    }]);
    setNewDesc('');
    setNewAmount('');
    setSettlements(null);
    setTotals(null);
  }, [newDesc, newAmount, newPaidBy, newSplit]);

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setSettlements(null);
    setTotals(null);
  };

  const calculate = useCallback(() => {
    const balances: Record<string, number> = {};
    people.forEach(p => { balances[p.name] = 0; });
    const personTotals: Record<string, number> = {};
    people.forEach(p => { personTotals[p.name] = 0; });

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach(name => {
        balances[name] = (balances[name] ?? 0) - share;
        personTotals[name] = (personTotals[name] ?? 0) + share;
      });
      balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.amount;
    });

    setSettlements(simplifyDebts(balances));
    setTotals(personTotals);
  }, [people, expenses]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <ToolLayout
        toolSlug="expense-splitter"
      title="Expense Splitter"
      description="Split group expenses fairly. Add people, track who paid what, and get a simplified debt settlement plan."
      icon="💰"
      relatedTools={[
        { name: 'Loan Calculator', href: '/tools/loan-calculator', icon: '🏦' },
        { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
        { name: 'Unit Converter', href: '/tools/unit-converter', icon: '📐' },
      ]}
      faqs={[
        {
          q: 'Is the expense splitter free?',
          a: 'Yes, entirely free with no account required. Add as many people and expenses as you need.',
        },
        {
          q: 'How does the expense splitter work?',
          a: 'Add all participants, then log each expense with who paid and which people share the cost. The tool calculates each person\'s net balance and produces a minimal set of money transfers to settle all debts — often fewer transactions than splitting every bill individually.',
        },
        {
          q: 'Is my financial data stored or sent anywhere?',
          a: 'No. All calculations happen entirely in your browser. No data is sent to any server and nothing is saved when you close the tab.',
        },
        {
          q: 'What happens if expenses are not split equally?',
          a: 'Currently, each expense is divided equally among the selected participants. If you need custom splits (e.g. percentage-based), you can add separate expense entries to approximate unequal shares.',
        },
        {
          q: 'How does this compare to apps like Splitwise?',
          a: 'Splitwise and similar apps store your data in the cloud and offer persistent group histories. This tool is instant and private — ideal for one-off trips or dinners where you just need the math without creating an account.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Add People */}
        <div className="card">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">1. Add People</h2>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Person name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPerson()}
            />
            <button onClick={addPerson} className="btn-primary flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {people.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {people.map(p => (
                <span key={p.id} className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 rounded-full text-sm text-stone-700">
                  {p.name}
                  <button onClick={() => removePerson(p.id)} className="text-stone-600 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Add Expense */}
        {people.length >= 2 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-stone-900 mb-3">2. Add Expenses</h2>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="e.g. Dinner, Hotel…" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                </div>
                <div>
                  <label className="label">Amount ($)</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Paid by</label>
                <select className="input" value={newPaidBy} onChange={e => setNewPaidBy(e.target.value)}>
                  <option value="">Select person…</option>
                  {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Split between</label>
                <div className="flex flex-wrap gap-2">
                  {people.map(p => (
                    <label key={p.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSplit.includes(p.name)}
                        onChange={e => setNewSplit(prev => e.target.checked ? [...prev, p.name] : prev.filter(n => n !== p.name))}
                        className="w-4 h-4 accent-violet-500"
                      />
                      <span className="text-sm text-stone-700">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={addExpense} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>
          </div>
        )}

        {/* Expense List */}
        {expenses.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-900">Expenses ({expenses.length})</h2>
              <span className="text-sm text-violet-600 font-bold">Total: ${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{e.desc}</p>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Paid by <span className="text-stone-700">{e.paidBy}</span> · split {e.splitBetween.length} ways
                    </p>
                  </div>
                  <span className="text-emerald-700 font-bold shrink-0">${e.amount.toFixed(2)}</span>
                  <button onClick={() => removeExpense(e.id)} className="text-stone-600 hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={calculate} className="btn-primary w-full justify-center mt-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Calculate Settlements
            </button>
          </div>
        )}

        {/* Results */}
        {settlements !== null && (
          <div className="space-y-4">
            {/* Per-person totals */}
            {totals && (
              <div className="card">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Per-Person Share</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(totals).map(([name, amt]) => (
                    <div key={name} className="bg-stone-50 rounded-xl p-3 text-center">
                      <p className="text-white font-medium text-sm">{name}</p>
                      <p className="text-violet-600 font-bold text-lg">${amt.toFixed(2)}</p>
                      <p className="text-stone-600 text-xs">owes in total</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settlements */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                {settlements.length === 0 ? 'All settled up! 🎉' : `Settlement Plan (${settlements.length} transactions)`}
              </h3>
              {settlements.length === 0 ? (
                <p className="text-stone-500 text-sm">Everyone owes the same amount — no transfers needed.</p>
              ) : (
                <div className="space-y-2">
                  {settlements.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/80 border border-emerald-500/20 rounded-xl text-sm">
                      <span className="text-stone-700 font-medium">{s.from}</span>
                      <span className="text-stone-500">→ pays</span>
                      <span className="text-stone-700 font-medium">{s.to}</span>
                      <span className="ml-auto text-emerald-700 font-bold">${s.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
