const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let username;

  // For POST, username is expected in the JSON body
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    username = body && body.username;
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'username' in request body" }),
    };
  }

  try {
    const result = await dynamo
      .get({
        TableName: process.env.TABLE_NAME,
        Key: { username },
      })
      .promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message,
      }),
    };
  }
};
