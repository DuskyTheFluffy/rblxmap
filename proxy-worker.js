// ══════════════════════════════════════════════
// LOCAL PROXY WORKER
// Runs entirely in browser - no external servers needed!
// ══════════════════════════════════════════════

self.onmessage = async function(e) {
  const { method, url, headers, body } = e.data;
  
  try {
    // Create blob for proxy handler
    const code = export default async function handler(req) {
      const targetUrl = decodeURIComponent(new URL(req.url).searchParams.get('url') || '');
      let bodyText = '';
      if (req.method === 'POST' && req.body) {
        bodyText = await req.text();
      }
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        body: bodyText || null
      });
      return new Response(response.body, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    };
    
    const blob = new Blob([code], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    await navigator.serviceWorker.register(workerUrl, { scope: '/proxy/' });
    
    return {
      success: true,
      proxyUrl: '/proxy/' + encodeURIComponent(url)
    };
  } catch (error) {
    console.error('Proxy worker error:', error);
    return { success: false, error: error.message };
  }
};