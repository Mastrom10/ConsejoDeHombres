import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

const s3Client = new S3Client({
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey
  }
});

export async function uploadImageToS3(
  file: Express.Multer.File,
  folder: string = 'peticiones'
): Promise<string> {
  const fileExtension = file.originalname.split('.').pop() || 'jpg';
  const fileName = `${folder}/${randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.awsBucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  });

  await s3Client.send(command);

  // Construir la URL pública
  // Para regiones como us-east-1, el formato es diferente
  const s3Domain = env.awsRegion === 'us-east-1' 
    ? `s3.amazonaws.com`
    : `s3.${env.awsRegion}.amazonaws.com`;
  const publicUrl = `https://${env.awsBucketName}.${s3Domain}/${fileName}`;
  return publicUrl;
}

export async function uploadMultipleImagesToS3(
  files: Express.Multer.File[],
  folder: string = 'peticiones'
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImageToS3(file, folder));
  return Promise.all(uploadPromises);
}

