import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'super-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsBucketName: process.env.AWS_S3_BUCKET_NAME || ''
};
