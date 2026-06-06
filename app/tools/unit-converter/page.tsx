'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';


type Category = 'Length' | 'Weight' | 'Temperature' | 'Area' | 'Volume' | 'Speed' | 'Data' | 'Time';

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const CATEGORIES: Record<Category, UnitDef[]> = {
  Length: [
    { label: 'Meter (m)', toBase: v => v, fromBase: v => v },
    { label: 'Kilometer (km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: 'Centimeter (cm)', toBase: v => v / 100, fromBase: v => v * 100 },
    { label: 'Millimeter (mm)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: 'Micrometer (μm)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { label: 'Nanometer (nm)', toBase: v => v / 1e9, fromBase: v => v * 1e9 },
    { label: 'Mile (mi)', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    { label: 'Yard (yd)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { label: 'Foot (ft)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { label: 'Inch (in)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { label: 'Nautical Mile', toBase: v => v * 1852, fromBase: v => v / 1852 },
    { label: 'Light Year', toBase: v => v * 9.461e15, fromBase: v => v / 9.461e15 },
  ],
  Weight: [
    { label: 'Kilogram (kg)', toBase: v => v, fromBase: v => v },
    { label: 'Gram (g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: 'Milligram (mg)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { label: 'Metric Ton (t)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: 'Pound (lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    { label: 'Ounce (oz)', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    { label: 'Stone (st)', toBase: v => v * 6.35029, fromBase: v => v / 6.35029 },
    { label: 'US Ton (short ton)', toBase: v => v * 907.185, fromBase: v => v / 907.185 },
    { label: 'UK Ton (long ton)', toBase: v => v * 1016.05, fromBase: v => v / 1016.05 },
    { label: 'Carat (ct)', toBase: v => v * 0.0002, fromBase: v => v / 0.0002 },
  ],
  Temperature: [
    { label: 'Celsius (°C)', toBase: v => v, fromBase: v => v },
    { label: 'Fahrenheit (°F)', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
    { label: 'Kelvin (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    { label: 'Rankine (°R)', toBase: v => (v - 491.67) * 5 / 9, fromBase: v => (v + 273.15) * 9 / 5 },
  ],
  Area: [
    { label: 'Square Meter (m²)', toBase: v => v, fromBase: v => v },
    { label: 'Square Kilometer (km²)', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { label: 'Square Centimeter (cm²)', toBase: v => v / 1e4, fromBase: v => v * 1e4 },
    { label: 'Square Millimeter (mm²)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { label: 'Square Mile (mi²)', toBase: v => v * 2589988.11, fromBase: v => v / 2589988.11 },
    { label: 'Square Yard (yd²)', toBase: v => v * 0.836127, fromBase: v => v / 0.836127 },
    { label: 'Square Foot (ft²)', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    { label: 'Square Inch (in²)', toBase: v => v * 0.000645, fromBase: v => v / 0.000645 },
    { label: 'Hectare (ha)', toBase: v => v * 1e4, fromBase: v => v / 1e4 },
    { label: 'Acre', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
  ],
  Volume: [
    { label: 'Liter (L)', toBase: v => v, fromBase: v => v },
    { label: 'Milliliter (mL)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: 'Cubic Meter (m³)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: 'Cubic Centimeter (cm³)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: 'Cubic Foot (ft³)', toBase: v => v * 28.3168, fromBase: v => v / 28.3168 },
    { label: 'Cubic Inch (in³)', toBase: v => v * 0.016387, fromBase: v => v / 0.016387 },
    { label: 'US Gallon', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    { label: 'UK Gallon', toBase: v => v * 4.54609, fromBase: v => v / 4.54609 },
    { label: 'US Quart', toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
    { label: 'US Pint', toBase: v => v * 0.473176, fromBase: v => v / 0.473176 },
    { label: 'US Fluid Ounce', toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
    { label: 'Tablespoon (tbsp)', toBase: v => v * 0.0147868, fromBase: v => v / 0.0147868 },
    { label: 'Teaspoon (tsp)', toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
  ],
  Speed: [
    { label: 'Meters/second (m/s)', toBase: v => v, fromBase: v => v },
    { label: 'Kilometers/hour (km/h)', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { label: 'Miles/hour (mph)', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { label: 'Feet/second (ft/s)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { label: 'Knot (kn)', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    { label: 'Mach (M)', toBase: v => v * 340.29, fromBase: v => v / 340.29 },
  ],
  Data: [
    { label: 'Byte (B)', toBase: v => v, fromBase: v => v },
    { label: 'Kilobyte (KB)', toBase: v => v * 1024, fromBase: v => v / 1024 },
    { label: 'Megabyte (MB)', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
    { label: 'Gigabyte (GB)', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
    { label: 'Terabyte (TB)', toBase: v => v * 1.0995e12, fromBase: v => v / 1.0995e12 },
    { label: 'Petabyte (PB)', toBase: v => v * 1.1259e15, fromBase: v => v / 1.1259e15 },
    { label: 'Bit', toBase: v => v / 8, fromBase: v => v * 8 },
    { label: 'Kilobit (Kb)', toBase: v => v * 128, fromBase: v => v / 128 },
    { label: 'Megabit (Mb)', toBase: v => v * 131072, fromBase: v => v / 131072 },
    { label: 'Gigabit (Gb)', toBase: v => v * 134217728, fromBase: v => v / 134217728 },
  ],
  Time: [
    { label: 'Second (s)', toBase: v => v, fromBase: v => v },
    { label: 'Millisecond (ms)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: 'Microsecond (μs)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { label: 'Nanosecond (ns)', toBase: v => v / 1e9, fromBase: v => v * 1e9 },
    { label: 'Minute (min)', toBase: v => v * 60, fromBase: v => v / 60 },
    { label: 'Hour (h)', toBase: v => v * 3600, fromBase: v => v / 3600 },
    { label: 'Day', toBase: v => v * 86400, fromBase: v => v / 86400 },
    { label: 'Week', toBase: v => v * 604800, fromBase: v => v / 604800 },
    { label: 'Month (avg)', toBase: v => v * 2629800, fromBase: v => v / 2629800 },
    { label: 'Year', toBase: v => v * 31557600, fromBase: v => v / 31557600 },
    { label: 'Decade', toBase: v => v * 315576000, fromBase: v => v / 315576000 },
    { label: 'Century', toBase: v => v * 3155760000, fromBase: v => v / 3155760000 },
  ],
};

const CATEGORY_TABS: Category[] = ['Length', 'Weight', 'Temperature', 'Area', 'Volume', 'Speed', 'Data', 'Time'];

function formatResult(n: number): string {
  if (!isFinite(n)) return 'Invalid';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) return n.toExponential(6);
  if (abs >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return n.toPrecision(10).replace(/\.?0+$/, '');
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('Length');
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(2);
  const [inputVal, setInputVal] = useState('1');

  const units = CATEGORIES[category];

  const result = useMemo(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return '';
    const inBase = units[fromIdx].toBase(num);
    const out = units[toIdx].fromBase(inBase);
    return formatResult(out);
  }, [inputVal, fromIdx, toIdx, units]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromIdx(0);
    setToIdx(Math.min(2, CATEGORIES[cat].length - 1));
    setInputVal('1');
  };

  const swap = () => {
    const tmp = fromIdx;
    setFromIdx(toIdx);
    setToIdx(tmp);
  };

  return (
    <ToolLayout
        toolSlug="unit-converter"
      title="Unit Converter"
      description="Convert between all common units — length, weight, temperature, area, volume, speed, data, and time. Real-time conversion with 8 categories."
      icon="📐"
      relatedTools={[
        { name: 'Age Calculator', href: '/tools/age-calculator', icon: '🎂' },
        { name: 'Loan Calculator', href: '/tools/loan-calculator', icon: '🏦' },
        { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
      ]}
    >
      <div className="space-y-5">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Converter card */}
        <div className="card space-y-4">
          {/* From */}
          <div>
            <label className="label">From</label>
            <div className="flex gap-3">
              <select
                className="input flex-1"
                value={fromIdx}
                onChange={e => setFromIdx(Number(e.target.value))}
              >
                {units.map((u, i) => (
                  <option key={u.label} value={i}>{u.label}</option>
                ))}
              </select>
              <input
                type="number"
                className="input w-36"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={swap}
              className="btn-secondary text-sm py-1.5 px-4"
            >
              ⇅ Swap
            </button>
          </div>

          {/* To */}
          <div>
            <label className="label">To</label>
            <div className="flex gap-3">
              <select
                className="input flex-1"
                value={toIdx}
                onChange={e => setToIdx(Number(e.target.value))}
              >
                {units.map((u, i) => (
                  <option key={u.label} value={i}>{u.label}</option>
                ))}
              </select>
              <div className="input w-36 bg-gray-900 text-emerald-400 font-mono font-bold select-all cursor-text">
                {result || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion summary */}
        {result && (
          <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-sm text-center">
            <span className="text-gray-300">
              <span className="text-white font-semibold">{inputVal} {units[fromIdx].label}</span>
              {' = '}
              <span className="text-violet-400 font-bold text-lg">{result} {units[toIdx].label}</span>
            </span>
          </div>
        )}

        {/* Quick all-units table */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">All {category} Units</h3>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {units.map((u, i) => {
              const num = parseFloat(inputVal);
              if (isNaN(num)) return null;
              const inBase = units[fromIdx].toBase(num);
              const val = u.fromBase(inBase);
              return (
                <div key={u.label} className={`flex justify-between items-center py-1.5 px-3 rounded-lg text-sm ${i === toIdx ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-gray-800/50'}`}>
                  <span className={`${i === fromIdx ? 'text-white font-medium' : 'text-gray-400'}`}>{u.label}</span>
                  <span className={`font-mono ${i === toIdx ? 'text-violet-400 font-bold' : 'text-gray-300'}`}>{formatResult(val)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
