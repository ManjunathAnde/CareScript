const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.PATIENTS_TABLE;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;

  if (!id) {
    return respond(400, { error: 'Patient ID is required' });
  }

  if (id === 'COUNTER') {
    return respond(404, { error: 'Patient not found' });
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { patient_id: id },
    }));

    if (!result.Item) {
      return respond(404, { error: 'Patient not found' });
    }

    return respond(200, result.Item);
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
};
