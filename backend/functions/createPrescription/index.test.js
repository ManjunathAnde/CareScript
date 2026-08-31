process.env.PATIENTS_TABLE = 'test-patients-table';
process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table'; //Using both env vars as the function touches both DynamoDB tables

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index');

beforeEach(() => {
  ddbMock.reset(); //Reset all configurations before each test
});

const validMedications = [
  { name: 'Amoxicillin', dosage: '500mg', frequency: 'twice daily' },
];

test('creates a prescription with valid input', async () => {
  ddbMock.on(GetCommand).resolves({
    Item: { patient_id: 'W001', name: 'John', age: 30 },//patient record returned when handler looks up for patient_id record before creating prescription
  });
  ddbMock.on(TransactWriteCommand).resolves({});//Letting transaction suceed for next code to be tested

  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: validMedications }),
  }); //Mocking the JavaScript Object coming to the handler function from the Dr-side frontend

  expect(result.statusCode).toBe(201); // Expected status code is 201
  const body = JSON.parse(result.body);
  expect(body.patient_id).toBe('W001');
  expect(body.status).toBe('pending');
});

test('rejects missing patient_id', async () => {
  const result = await handler({
    body: JSON.stringify({ medications: validMedications }),
  });
  expect(result.statusCode).toBe(400); //Prescription is valid but patient_id is missing should return 400
});

test('rejects empty medications array', async () => {
  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: [] }),
  });
  expect(result.statusCode).toBe(400); // Empty array of medication should return 400
});

test('rejects malformed medication object', async () => {
  const result = await handler({
    body: JSON.stringify({
      patient_id: 'W001',
      medications: [{ name: 'Amoxicillin' }], // missing dosage and frequency; incomplete medication array
    }),
  });
  expect(result.statusCode).toBe(400); // should return 400
});

test('returns 404 if patient does not exist', async () => {
  ddbMock.on(GetCommand).resolves({ Item: undefined }); //No patient identified should return 404

  const result = await handler({
    body: JSON.stringify({ patient_id: 'W999', medications: validMedications }),
  }); /// W999 patient_id is not present in the demo data , even with a valid prescription

  expect(result.statusCode).toBe(404);
});

test('returns 500 with conflict message if transaction is cancelled', async () => {
  ddbMock.on(GetCommand).resolves({
    Item: { patient_id: 'W001', name: 'John', age: 30 },
  });

  const error = new Error('Transaction cancelled');
  error.name = 'TransactionCanceledException';
  error.CancellationReasons = [{ Code: 'ConditionalCheckFailed' }];
  ddbMock.on(TransactWriteCommand).rejects(error); //Test matching the error handling in handler function
// Based on AWS SDK documented behavior of transaction.
  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: validMedications }),
  }); //Mocking data to handler to have valient patient_id and valid medication but with a failed transaction

  expect(result.statusCode).toBe(500);
  const body = JSON.parse(result.body);
  expect(body.error).toBe('Prescription could not be created due to a conflict');
});//The response should match the handled exception message in the handler code and return 500

