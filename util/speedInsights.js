/**
 * Vercel Speed Insights middleware for Express
 * Injects Speed Insights tracking script into HTML responses
 */

const SPEED_INSIGHTS_SCRIPT = `
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
`

/**
 * Middleware to inject Speed Insights into HTML responses
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function injectSpeedInsights(req, res, next) {
  const originalSend = res.send

  res.send = function (data) {
    // Only inject into HTML responses
    const contentType = res.get('Content-Type') || ''
    const isHtml =
      contentType.includes('text/html') ||
      (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html'))

    if (isHtml && typeof data === 'string') {
      // Inject the script before the closing </body> tag
      if (data.includes('</body>')) {
        data = data.replace('</body>', `${SPEED_INSIGHTS_SCRIPT}</body>`)
      } else if (data.includes('</html>')) {
        // Fallback: inject before closing </html> if no </body> tag
        data = data.replace('</html>', `${SPEED_INSIGHTS_SCRIPT}</html>`)
      }
    }

    return originalSend.call(this, data)
  }

  next()
}

module.exports = injectSpeedInsights
