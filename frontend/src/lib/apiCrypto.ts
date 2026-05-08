const API_CRYPTO_KEY = import.meta.env.VITE_API_CRYPTO_KEY ?? 'creditpass-api-envelope-key'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function base64ToBytes(base64: string) {
  const binary = window.atob(base64)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function buildCryptoKey() {
  const keyMaterial = textEncoder.encode(API_CRYPTO_KEY)
  const digest = await crypto.subtle.digest('SHA-256', keyMaterial)
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt'])
}

export function isEncryptedEnvelope(value: unknown): value is { encrypted: true; payload: string } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'encrypted' in value &&
      (value as { encrypted?: unknown }).encrypted === true &&
      'payload' in value &&
      typeof (value as { payload?: unknown }).payload === 'string',
  )
}

export async function decryptApiPayload(payload: string) {
  const [ivPart, cipherPart] = payload.split('.')
  if (!ivPart || !cipherPart) {
    throw new Error('响应密文格式错误')
  }

  const iv = base64ToBytes(ivPart)
  const cipherBytes = base64ToBytes(cipherPart)
  const key = await buildCryptoKey()
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes)
  const plainText = textDecoder.decode(plainBuffer)
  return JSON.parse(plainText)
}
