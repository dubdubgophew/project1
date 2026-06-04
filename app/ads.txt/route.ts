export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('google.com, pub-7233937066598688, DIRECT, f08c47fec0942fa0\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
