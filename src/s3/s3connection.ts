import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.AWS_ACESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: process.env.AWS_REGION,
});

export const connectS3 = () => {
  const s3 = new aws.S3();
  return s3;
};
