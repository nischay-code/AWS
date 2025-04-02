const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new DynamoDBClient();

exports.handler = async (event) => {
  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format in request body." }),
    };
  }

  if (!body.name || !body.email || !body.password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: name, email, password' }),
    };
  }

  const userId = uuidv4();
  const params = {
    TableName: process.env.USER_TABLE,
    Item: {
      userId: userId,
      name: body.name,
      email: body.email,
      password: body.password, 
    },
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered successfully', userId: userId }),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error registering user" }),
    };
  }
};
