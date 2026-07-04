const BACKEND_PROXY_URL = (process.env.BACKEND_PROXY_URL || process.env.API_PROXY_URL || '')
  .trim()
  .replace(/\/$/, '');

function filterRequestHeaders(headers) {
  const forwarded = {};

  for (const [key, value] of Object.entries(headers)) {
    if (!value) {
      continue;
    }

    const normalizedValue = Array.isArray(value) ? value.join(', ') : value;
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === 'host'
      || lowerKey === 'connection'
      || lowerKey === 'content-length'
      || lowerKey === 'accept-encoding'
      || lowerKey === 'x-forwarded-host'
      || lowerKey === 'x-forwarded-proto'
    ) {
      continue;
    }

    forwarded[key] = normalizedValue;
  }

  forwarded['bypass-tunnel-reminder'] = '1';

  return forwarded;
}

function copyResponseHeaders(sourceHeaders, res) {
  const skipped = new Set([
    'connection',
    'content-length',
    'content-encoding',
    'transfer-encoding',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'upgrade',
  ]);

  for (const [key, value] of sourceHeaders.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'set-cookie' || skipped.has(lowerKey)) {
      continue;
    }

    res.setHeader(key, value);
  }

  const setCookieHeaders =
    typeof sourceHeaders.getSetCookie === 'function'
      ? sourceHeaders.getSetCookie()
      : [];

  if (setCookieHeaders.length > 0) {
    res.setHeader('Set-Cookie', setCookieHeaders);
    return;
  }

  const singleSetCookie = sourceHeaders.get('set-cookie');
  if (singleSetCookie) {
    res.setHeader('Set-Cookie', singleSetCookie);
  }
}

module.exports = async function proxyHandler(req, res) {
  if (!BACKEND_PROXY_URL) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Missing BACKEND_PROXY_URL' }));
    return;
  }

  const targetUrl = new URL(req.url, BACKEND_PROXY_URL);
  const requestInit = {
    method: req.method,
    headers: filterRequestHeaders(req.headers),
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(String(req.method || 'GET').toUpperCase())) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    requestInit.body = Buffer.concat(chunks);
  }

  const upstreamResponse = await fetch(targetUrl, requestInit);
  const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer());

  res.statusCode = upstreamResponse.status;
  copyResponseHeaders(upstreamResponse.headers, res);
  res.end(bodyBuffer);
};
