const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PRESCRIPTIONS_TABLE = process.env.PRESCRIPTIONS_TABLE;

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
  const pathPatientId = event.pathParameters && event.pathParameters.patient_id;
  const queryStatus = event.queryStringParameters && event.queryStringParameters.status;

  if (typeof pathPatientId === 'string') {
    return handlePatientHistory(pathPatientId);
  }

  if (typeof queryStatus === 'string') {
    return handleStatusQuery(queryStatus);
  }

  return respond(400, { error: 'Invalid request' });
};

async function handlePatientHistory(rawPatientId) {
  const patientId = rawPatientId.trim();

  if (!patientId) {
    return respond(400, { error: 'patient_id is required' });
  }

  if (patientId === 'COUNTER') {
    return respond(404, { error: 'Patient not found' });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: PRESCRIPTIONS_TABLE,
      IndexName: 'PatientIndex',
      KeyConditionExpression: 'patient_id = :pid',
      ExpressionAttributeValues: { ':pid': patientId },
      ScanIndexForward: false,
    }));

    return respond(200, result.Items || []);
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
}

async function handleStatusQuery(status) {
  if (status !== 'pending' && status !== 'dispensed') {
    return respond(400, { error: 'status must be pending or dispensed' });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: PRESCRIPTIONS_TABLE,
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status },
      ScanIndexForward: false,
    }));

    return respond(200, result.Items || []);
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
}
