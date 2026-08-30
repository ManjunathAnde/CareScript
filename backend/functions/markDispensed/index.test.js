process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table';
process.env.SES_FROM_EMAIL = 'test@example.com';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);

const { handler } = require('./index');

beforeEach(() => {
  ddbMock.reset();
  sesMock.reset();
});

const updatedPrescription = {
  prescription_id: 'p1',
  patient_id: 'W001',
  patient_name: 'John',
  status: 'dispensed',
  medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'twice daily' }],
};

test('marks prescription dispensed with no email', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed' }),
  });

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.status).toBe('dispensed');
  expect(body.email_sent).toBeUndefined();
});

test('marks prescription dispensed and sends email successfully', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });
  sesMock.on(SendEmailCommand).resolves({});

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed', email: 'patient@example.com' }),
  });

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.email_sent).toBe(true);
});

test('marks dispensed successfully even if email sending fails', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });
  sesMock.on(SendEmailCommand).rejects(new Error('SES failure'));

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed', email: 'patient@example.com' }),
  });

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.email_sent).toBe(false);
});

test('rejects missing prescription_id', async () => {
  const result = await handler({
    pathParameters: {},
    body: JSON.stringify({ status: 'dispensed' }),
  });
  expect(result.statusCode).toBe(400);
});

test('rejects status other than dispensed', async () => {
  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  expect(result.statusCode).toBe(400);
});

test('returns 404 when prescription does not exist', async () => {
  const condError = new Error('conditional check failed');
  condError.name = 'ConditionalCheckFailedException';
  ddbMock.on(UpdateCommand).rejects(condError);
  ddbMock.on(GetCommand).resolves({ Item: undefined });

  const result = await handler({
    pathParameters: { prescription_id: 'p999' },
    body: JSON.stringify({ status: 'dispensed' }),
  });

  expect(result.statusCode).toBe(404);
});

test('returns 409 when prescription already dispensed', async () => {
  const condError = new Error('conditional check failed');
  condError.name = 'ConditionalCheckFailedException';
  ddbMock.on(UpdateCommand).rejects(condError);
  ddbMock.on(GetCommand).resolves({ Item: { ...updatedPrescription, status: 'dispensed' } });

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed' }),
  });

  expect(result.statusCode).toBe(409);
  const body = JSON.parse(result.body);
  expect(body.error).toBe('Prescription already dispensed');
});