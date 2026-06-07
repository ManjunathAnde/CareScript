const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

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
  const rawPrescriptionId = event.pathParameters && event.pathParameters.prescription_id;
  const prescriptionId = typeof rawPrescriptionId === 'string' ? rawPrescriptionId.trim() : '';

  if (!prescriptionId) {
    return respond(400, { error: 'prescription_id is required' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid request body' });
  }

  if (body.status !== 'dispensed') {
    return respond(400, { error: 'status must be dispensed' });
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: PRESCRIPTIONS_TABLE,
      Key: { prescription_id: prescriptionId },
      UpdateExpression: 'SET #s = :dispensed',
      ConditionExpression: 'attribute_exists(prescription_id) AND #s = :pending',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':dispensed': 'dispensed',
        ':pending': 'pending',
      },
    }));

    return respond(200, {
      prescription_id: prescriptionId,
      status: 'dispensed',
    });

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      try {
        const lookup = await docClient.send(new GetCommand({
          TableName: PRESCRIPTIONS_TABLE,
          Key: { prescription_id: prescriptionId },
        }));

        if (!lookup.Item) {
          return respond(404, { error: 'Prescription not found' });
        }

        if (lookup.Item.status === 'dispensed') {
          return respond(409, { error: 'Prescription already dispensed' });
        }

        return respond(409, { error: 'Invalid prescription state' });

      } catch (lookupErr) {
        console.error('Lookup after ConditionalCheckFailedException failed:', lookupErr);
        return respond(500, { error: 'Internal server error' });
      }
    }

    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
};
