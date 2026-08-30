process.env.PATIENTS_TABLE = 'test-patients-table';
process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index');

beforeEach(() => {
  ddbMock.reset();
});

const validMedications = [
  { name: 'Amoxicillin', dosage: '500mg', frequency: 'twice daily' },
];

test('creates a prescription with valid input', async () => {
  ddbMock.on(GetCommand).resolves({
    Item: { patient_id: 'W001', name: 'John', age: 30 },
  });
  ddbMock.on(TransactWriteCommand).resolves({});

  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: validMedications }),
  });

  expect(result.statusCode).toBe(201);
  const body = JSON.parse(result.body);
  expect(body.patient_id).toBe('W001');
  expect(body.status).toBe('pending');
});

test('rejects missing patient_id', async () => {
  const result = await handler({
    body: JSON.stringify({ medications: validMedications }),
  });
  expect(result.statusCode).toBe(400);
});

test('rejects empty medications array', async () => {
  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: [] }),
  });
  expect(result.statusCode).toBe(400);
});

test('rejects malformed medication object', async () => {
  const result = await handler({
    body: JSON.stringify({
      patient_id: 'W001',
      medications: [{ name: 'Amoxicillin' }], // missing dosage and frequency
    }),
  });
  expect(result.statusCode).toBe(400);
});

test('returns 404 if patient does not exist', async () => {
  ddbMock.on(GetCommand).resolves({ Item: undefined });

  const result = await handler({
    body: JSON.stringify({ patient_id: 'W999', medications: validMedications }),
  });

  expect(result.statusCode).toBe(404);
});

test('returns 500 with conflict message if transaction is cancelled', async () => {
  ddbMock.on(GetCommand).resolves({
    Item: { patient_id: 'W001', name: 'John', age: 30 },
  });

  const error = new Error('Transaction cancelled');
  error.name = 'TransactionCanceledException';
  error.CancellationReasons = [{ Code: 'ConditionalCheckFailed' }];
  ddbMock.on(TransactWriteCommand).rejects(error);

  const result = await handler({
    body: JSON.stringify({ patient_id: 'W001', medications: validMedications }),
  });

  expect(result.statusCode).toBe(500);
  const body = JSON.parse(result.body);
  expect(body.error).toBe('Prescription could not be created due to a conflict');
});