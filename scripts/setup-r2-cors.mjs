import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'

// Lire .env.local manuellement
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
Object.assign(process.env, env)

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

await r2.send(new PutBucketCorsCommand({
  Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'notre-calendrier',
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: [
          'https://notre-calendrier.vercel.app',
          'http://localhost:3000',
        ],
        AllowedMethods: ['GET', 'PUT', 'HEAD', 'DELETE'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      },
    ],
  },
}))

console.log('CORS R2 configuré avec succès !')
