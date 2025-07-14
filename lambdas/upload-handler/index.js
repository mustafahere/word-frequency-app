const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { username, fileName } = body;

  const key = `uploads/${username}/${fileName}`;

  const url = s3.getSignedUrl("putObject", {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: "application/octet-stream",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl: url }),
  };
};
