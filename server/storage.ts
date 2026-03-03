import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";
import fs from "fs";
import path from "path";

/** Directory for local file uploads when S3 is not configured */
export const LOCAL_UPLOADS_DIR = process.env.NODE_ENV === "development"
  ? path.resolve(import.meta.dirname, "..", "..", "data", "uploads")
  : path.resolve(import.meta.dirname, "..", "data", "uploads");

function hasS3Credentials(): boolean {
  return !!(ENV.awsAccessKeyId && ENV.awsSecretAccessKey && ENV.awsS3Bucket);
}

function getS3Client(): S3Client {
  if (!hasS3Credentials()) {
    throw new Error(
      "AWS S3 credentials missing: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET"
    );
  }

  return new S3Client({
    region: ENV.awsRegion,
    credentials: {
      accessKeyId: ENV.awsAccessKeyId!,
      secretAccessKey: ENV.awsSecretAccessKey!,
    },
  });
}

/**
 * Saves a file locally when S3 is not configured.
 * Files are stored in data/uploads/ and served at /uploads/
 */
async function localPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(LOCAL_UPLOADS_DIR, key);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });

  const body = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
  fs.writeFileSync(filePath, body);

  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Fallback to local storage when S3 is not configured
  if (!hasS3Credentials()) {
    console.log("[Storage] S3 not configured — saving locally");
    return localPut(relKey, data);
  }

  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");

  const body =
    typeof data === "string" ? Buffer.from(data, "utf-8") : data;

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = `https://${ENV.awsS3Bucket}.s3.${ENV.awsRegion}.amazonaws.com/${key}`;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  // For local storage, just return the local URL
  if (!hasS3Credentials()) {
    const key = relKey.replace(/^\/+/, "");
    return { key, url: `/uploads/${key}` };
  }

  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
    }),
    { expiresIn: 3600 } // 1 hour
  );

  return { key, url };
}
