import * as envalid from 'envalid';

export const config = envalid.cleanEnv(process.env, {
  PORT: envalid.str({ desc: 'Port number for the server to listen on' }),

  MONGO_DB: envalid.str({ desc: 'MongoDB connection string' }),
  SECRET: envalid.str({ desc: 'Secret key used for signing JWT tokens' }),

  AWS_BUCKET_NAME: envalid.str({ desc: 'AWS S3 bucket name for file storage' }),
  AWS_BUCKET_REGION: envalid.str({ desc: 'AWS S3 bucket region' }),
  AWS_ACCESS_KEY_ID: envalid.str({ desc: 'AWS access key ID for authentication' }),
  AWS_SECRET_ACCESS_KEY: envalid.str({ desc: 'AWS secret access key for authentication' }),

  REDIS_URL: envalid.str({ desc: 'Redis connection string' }),
});
