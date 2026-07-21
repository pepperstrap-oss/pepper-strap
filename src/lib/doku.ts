// =============================================
// src/lib/doku.ts
// Helper signature untuk DOKU Checkout (Non-SNAP)
// =============================================
import crypto from 'crypto'

export function getBaseUrl(isProduction: boolean) {
  return isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com'
}

function isoTimestamp() {
  // Format ISO UTC tanpa milidetik, misal: 2020-08-11T08:45:42Z
  return new Date().toISOString().split('.')[0] + 'Z'
}

// Signature untuk request POST (butuh Digest dari body)
export function generateSignaturePost(body: any, requestId: string, timestamp: string, requestTarget: string, secretKey: string) {
  const digest = crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64')
  const componentSignature = `Client-Id:${process.env.DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`
  const signature = 'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64')
  return { signature, digest }
}

// Signature untuk request GET (tanpa Digest)
export function generateSignatureGet(requestId: string, timestamp: string, requestTarget: string, secretKey: string) {
  const componentSignature = `Client-Id:${process.env.DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}`
  return 'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64')
}

export function newRequestId() {
  return crypto.randomUUID()
}

export function nowTimestamp() {
  return isoTimestamp()
}
