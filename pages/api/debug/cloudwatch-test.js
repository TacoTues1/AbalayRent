import {
  createRequestContext,
  getCloudWatchConfigStatus,
  logApiEvent,
} from '../../../lib/cloudwatch-logger'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.query.token || req.headers['x-debug-token']
  const expected = process.env.CRON_SECRET

  if (!expected || token !== expected) {
    return res.status(401).json({
      error: 'Unauthorized',
      hint: 'Pass ?token=<CRON_SECRET> or x-debug-token header',
    })
  }

  const context = createRequestContext(req, 'api/debug/cloudwatch-test')
  const result = await logApiEvent(context, {
    event: 'cloudwatch_test_event',
    meta: {
      source: 'manual_debug',
      timestamp: new Date().toISOString(),
    },
  })

  return res.status(result?.ok ? 200 : 500).json({
    success: Boolean(result?.ok),
    config: getCloudWatchConfigStatus(),
    publishResult: result,
  })
}
