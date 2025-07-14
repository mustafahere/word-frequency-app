const AWS = require("aws-sdk");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

const SUPPORTED_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

async function extractText(buffer, fileType) {
  console.log("Extracting text from file type:", fileType);

  switch (fileType) {
    case SUPPORTED_TYPES.pdf:
      const pdfData = await pdfParse(buffer);
      return pdfData.text;

    case SUPPORTED_TYPES.docx:
      const docxResult = await mammoth.extractRawText({ buffer });
      return docxResult.value;

    case SUPPORTED_TYPES.txt:
      return buffer.toString("utf-8");

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

exports.handler = async (event) => {
  console.log(
    "Lambda invocation started with event:",
    JSON.stringify(event, null, 2)
  );

  try {
    // Validate environment variables
    console.log("Checking environment variables...");
    if (!process.env.TABLE_NAME) {
      console.error("Missing TABLE_NAME environment variable");
      throw new Error("TABLE_NAME environment variable is not defined");
    }
    console.log("Environment variables validated successfully");

    // Validate input
    console.log("Validating input event structure...");
    if (!event.Records || !event.Records.length) {
      console.error("Invalid event structure:", JSON.stringify(event, null, 2));
      throw new Error("Invalid event structure: no Records found");
    }

    const record = event.Records[0];
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const bucket = record.s3.bucket.name;
    const fileName = key.split("/").pop();
    const username = key.split("/")[1];

    console.log("File details:", {
      bucket,
      key,
      fileName,
      username,
    });

    // Validate file type
    console.log("Validating file type...");
    const fileExt = fileName.split(".").pop().toLowerCase();
    const ext = SUPPORTED_TYPES[fileExt];
    if (!ext) {
      console.error(`Unsupported file type detected: ${fileExt}`);
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    console.log("File type validated:", { extension: fileExt, mimeType: ext });

    // Get file from S3
    console.log(`Fetching file from S3: ${bucket}/${key}`);
    const s3obj = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    console.log("Successfully retrieved file from S3");

    // Extract text
    console.log("Starting text extraction...");
    const text = await extractText(s3obj.Body, ext);
    console.log("Text extraction completed, text length:", text.length);

    // Process words
    console.log("Processing text and calculating word frequency...");
    const words = text.match(/\b\w+\b/g) || [];
    console.log(`Found ${words.length} words in the document`);

    const frequency = {};
    words.forEach((w) => {
      const lw = w.toLowerCase();
      frequency[lw] = (frequency[lw] || 0) + 1;
    });
    console.log(
      `Calculated frequency for ${Object.keys(frequency).length} unique words`
    );

    // Save to DynamoDB
    console.log("Saving results to DynamoDB...");
    const dynamoItem = {
      username,
      filename: fileName,
      frequency,
    };
    console.log("DynamoDB Item:", JSON.stringify(dynamoItem, null, 2));

    await dynamo
      .put({
        TableName: process.env.TABLE_NAME,
        Item: dynamoItem,
      })
      .promise();
    console.log("Successfully saved to DynamoDB");

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully processed file",
        filename: fileName,
      }),
    };
    console.log(
      "Lambda execution completed successfully:",
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error) {
    console.error("Lambda execution failed:", {
      error: error.message,
      stack: error.stack,
      filename: error.filename,
    });

    const errorResponse = {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message || "Internal server error",
        filename: error.filename,
      }),
    };
    console.log(
      "Returning error response:",
      JSON.stringify(errorResponse, null, 2)
    );
    return errorResponse;
  }
};
