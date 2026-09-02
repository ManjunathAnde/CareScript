const { randomUUID } = require('crypto'); //UUID generation
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PATIENTS_TABLE = process.env.PATIENTS_TABLE;
const PRESCRIPTIONS_TABLE = process.env.PRESCRIPTIONS_TABLE;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) { //HTTP request formatting.
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function isValidMedication(med) { //Check for valid medication
  return (
    med !== null && //Checking for vaid object with string non-empty inputs
    typeof med === 'object' &&
    !Array.isArray(med) &&
    typeof med.name === 'string' && med.name.trim() !== '' &&
    typeof med.dosage === 'string' && med.dosage.trim() !== '' &&
    typeof med.frequency === 'string' && med.frequency.trim() !== ''
  );
}

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid request body' }); //If empty, invalid request body
  }

  const { patient_id, medications } = body;

  if (!patient_id || typeof patient_id !== 'string' || patient_id.trim() === '') {
    return respond(400, { error: 'patient_id is required' }); //Check for patient_id
  }

  const normalizedPatientId = patient_id.trim(); 

  if (normalizedPatientId === 'COUNTER') {
    return respond(404, { error: 'Patient not found' }); //Patient_id should not be counter
  }

  if (!Array.isArray(medications) || medications.length === 0) { //Checking for array
    return respond(400, { error: 'medications must be a non-empty array' });
  } 

  if (!medications.every(isValidMedication)) { //Validates against each medication in the array
    return respond(400, { error: 'Each medication must have name, dosage, and frequency' });
  }

  try {
    const patientResult = await docClient.send(new GetCommand({
      TableName: PATIENTS_TABLE,
      Key: { patient_id: normalizedPatientId },
    }));

    if (!patientResult.Item) {
      return respond(404, { error: 'Patient not found' });
    }

    const { name: patient_name, age: patient_age } = patientResult.Item;
    const prescriptionId = randomUUID();
    const createdAt = new Date().toISOString();

    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: PRESCRIPTIONS_TABLE,
            Item: {
              prescription_id: prescriptionId,
              patient_id: normalizedPatientId,
              patient_name,
              patient_age,
              medications,
              status: 'pending',
              created_at: createdAt,
            },
            ConditionExpression: 'attribute_not_exists(prescription_id)',
          },
        },
        {
          Update: {
            TableName: PATIENTS_TABLE,
            Key: { patient_id: normalizedPatientId },
            UpdateExpression: 'ADD visit_count :inc',
            ExpressionAttributeValues: { ':inc': 1 },
            ConditionExpression: 'attribute_exists(patient_id)',
          },
        },
      ], 
    }));
//A transaction which performs putting in new prescription and increasing visit count
//as two indivisible operations on condition that prescription_id exists while insertion.

    return respond(201, {
      prescription_id: prescriptionId,
      patient_id: normalizedPatientId,
      status: 'pending',
      created_at: createdAt,
    });

  } catch (err) {
    if (err.name === 'TransactionCanceledException') {
      console.error('Transaction cancelled:', JSON.stringify(err.CancellationReasons));
      return respond(500, { error: 'Prescription could not be created due to a conflict' });
    }
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
};
