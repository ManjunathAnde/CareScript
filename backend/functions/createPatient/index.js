const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.PATIENTS_TABLE;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) { //formatting HTTP requests
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function formatPatientId(num) { //formatting final Patient ID with hardcoded "WXXX"
  return 'W' + String(num).padStart(3, '0');
}
 //The incoming HTTP request is stored in 'body variable'.
 // If it is empty or invalid JSON, the error is handled
exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid request body' });
  }

  const { name, age, gender } = body; //input fields validatoin

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return respond(400, { error: 'name is required' });
  }
  if (typeof age !== 'number' || age <= 0) {
    return respond(400, { error: 'age must be a positive number' });
  }
  if (!['Male', 'Female', 'Other'].includes(gender)) {
    return respond(400, { error: 'gender must be Male, Female, or Other' });
  }


  //Updating the counter and increasing by one as a new patient is created
  try {
    const counterResult = await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { patient_id: 'COUNTER' },
      UpdateExpression: 'ADD last_id :inc',
      ExpressionAttributeValues: { ':inc': 1 },
      ReturnValues: 'UPDATED_NEW',
    }));

    const patientId = formatPatientId(counterResult.Attributes.last_id);
    const createdAt = new Date().toISOString(); //timestamp of patient creation

    const item = {
      patient_id: patientId,
      name: name.trim(),
      age,
      gender,
      visit_count: 0,
      created_at: createdAt,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: item,
    })); //putting new patient in the table

    return respond(201, item);
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  } //error hadndling
};
