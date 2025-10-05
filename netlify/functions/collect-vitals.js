// Netlify Function: collect-vitals
// Minimal stub that accepts POSTed Web Vitals batches and logs them.
// In production, forward to analytics pipeline / store to DB.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    // Basic shape validation
    if (!Array.isArray(body.metrics)) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
    // eslint-disable-next-line no-console
    console.log('[collect-vitals] batch', {
      count: body.metrics.length,
      sessionId: body.sessionId,
      receivedAt: new Date().toISOString(),
    });
    return { statusCode: 204 };
  } catch (e) {
    return { statusCode: 400, body: 'Bad JSON' };
  }
};
