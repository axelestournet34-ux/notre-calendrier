import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
  CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'notre-calendrier'

export async function uploadToR2(path: string, file: File): Promise<void> {
  const buffer = Buffer.from(await file.arrayBuffer())
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  }))
}

export async function getR2Url(path: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: path }), { expiresIn })
}

export async function deleteFromR2(path: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: path })).catch(() => {})
}

export async function getPresignedUploadUrl(path: string, contentType: string): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: path, ContentType: contentType }),
    { expiresIn: 3600 }
  )
}

export async function initierMultipartUpload(path: string, contentType: string): Promise<string> {
  const res = await r2.send(new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: path, ContentType: contentType }))
  return res.UploadId!
}

export async function presignedUrlPart(path: string, uploadId: string, partNumber: number): Promise<string> {
  return getSignedUrl(
    r2,
    new UploadPartCommand({ Bucket: BUCKET, Key: path, UploadId: uploadId, PartNumber: partNumber }),
    { expiresIn: 3600 }
  )
}

export async function completerMultipartUpload(
  path: string, uploadId: string,
  parts: { ETag: string; PartNumber: number }[]
): Promise<void> {
  await r2.send(new CompleteMultipartUploadCommand({
    Bucket: BUCKET, Key: path, UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  }))
}

export async function annulerMultipartUpload(path: string, uploadId: string): Promise<void> {
  await r2.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: path, UploadId: uploadId })).catch(() => {})
}
