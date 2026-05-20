import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Color Code Converter — HEX to RGB, HSL, CMYK Online | Formly',
  description: 'Convert colors between HEX, RGB, HSL, HSV, and CMYK instantly. See color harmonies (complementary, triadic, split), tints and shades. Free online color converter.',
  keywords: ["color converter", "hex to rgb converter", "color code converter", "hex to hsl", "rgb to hex converter", "cmyk to rgb", "color format converter", "color picker converter", "css color converter", "pantone to hex converter"],
  openGraph: { title: 'Free Color Code Converter | Formly', description: 'Convert HEX, RGB, HSL, HSV, CMYK. Color harmonies, tints and shades. Free online color tool.', url: 'https://formly.tools/tools/color-converter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Color Code Converter | Formly', description: 'Free color converter — HEX, RGB, HSL, HSV, CMYK. Color harmonies & shades. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/color-converter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Color Code Converter"
        description="Convert colors between HEX, RGB, HSL, HSV, and CMYK instantly. See color harmonies (complementary, triadic, split), tints and shades. Free online color converter."
        url="https://formly.tools/tools/color-converter"
        category="DeveloperApplication"
        features={['Convert between HEX, RGB, HSL, HSV, CMYK', 'Color harmony generator (complementary, triadic, split)', 'Tints and shades palette', 'CSS color string output', 'Real-time color preview']}
        faqs={[{ q: "How do I convert HEX to RGB?", a: "Enter the HEX code (e.g. #7c3aed) and the converter instantly shows the RGB values (124, 58, 237). You can also do the reverse — enter RGB values to get the HEX code." }, { q: "What is the difference between HSL and HSV?", a: "HSL (Hue, Saturation, Lightness) and HSV (Hue, Saturation, Value/Brightness) are both cylindrical color models. HSL is used in CSS; HSV is common in design software. Both represent colors differently — 50% lightness in HSL ≠ 50% value in HSV." }, { q: "What are color harmonies?", a: "Color harmonies are combinations of colors that look visually pleasing together. Complementary colors are opposite on the color wheel. Triadic uses three evenly spaced colors. Split-complementary uses the two colors adjacent to the complementary." }, { q: "Can I use this for CSS?", a: "Yes — the output includes ready-to-copy CSS color strings: hex (#7c3aed), rgb(124, 58, 237), and hsl(263, 60%, 58%)." }]}
      />
      {children}
    </>
  );
}
