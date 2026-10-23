import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

function getBucketName() {
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION is not configured");
  }

  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }

  return bucket;
}

export async function uploadDocumentObject({ key, body, contentType }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteDocumentObject(key) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
}

export async function downloadDocumentObject(key) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error("S3 returned an empty document body");
  }

  return Buffer.from(await response.Body.transformToByteArray());
}