import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Unit Converter — Length, Weight, Temperature & More | Formly',
  description: 'Convert between 80+ units across 8 categories: length, weight, temperature, area, volume, speed, time, and data storage. Free online unit converter — no signup needed.',
  keywords: ["unit converter", "measurement converter", "unit conversion calculator", "length converter", "weight converter", "temperature converter", "metric to imperial converter", "online unit calculator", "free unit converter", "converter tool online"],
  openGraph: { title: 'Free Unit Converter | Formly', description: 'Convert 80+ units across length, weight, temperature, volume, speed & more. Free, instant.', url: 'https://formly.tools/tools/unit-converter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Unit Converter | Formly', description: 'Free unit converter — 80+ units, 8 categories. Length, weight, temperature, speed & more.' },
  alternates: { canonical: 'https://formly.tools/tools/unit-converter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Unit Converter"
        description="Convert between 80+ units across 8 categories: length, weight, temperature, area, volume, speed, time, and data storage. Free online unit converter — no signup needed."
        url="https://formly.tools/tools/unit-converter"
        category="UtilitiesApplication"
        features={['80+ units across 8 categories', 'Length, weight, temperature, area, volume, speed, time, data', 'Real-time conversion', 'Metric and imperial systems', 'No signup required']}
        faqs={[{ q: "What unit categories does it cover?", a: "Formly's unit converter covers 8 categories: Length (meters, feet, inches, miles, km), Weight (kg, lbs, oz, grams), Temperature (Celsius, Fahrenheit, Kelvin), Area, Volume, Speed, Time, and Digital Storage." }, { q: "Can it convert Celsius to Fahrenheit?", a: "Yes — enter the temperature value, select Celsius as input and Fahrenheit as output. The formula is °F = (°C × 9/5) + 32." }, { q: "Is it accurate for scientific conversions?", a: "Yes — all conversion factors are based on SI (International System of Units) standards and are accurate to multiple decimal places." }, { q: "Does it work offline?", a: "Yes — the unit converter runs entirely in your browser. Once the page loads, no internet connection is needed for conversions." }]}
      />
      {children}
    </>
  );
}
