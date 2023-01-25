import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.AWS_ACESS_KEY_ID2,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY2,
  signatureVersion: "v4",
  region: process.env.AWS_REGION2,
});

export const connectS3 = () => {
  const s3 = new aws.S3();
  return s3;
};
