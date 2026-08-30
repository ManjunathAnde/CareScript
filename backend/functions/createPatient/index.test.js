// 1. Set fake env vars FIRST, before requiring the handler
process.env.PATIENTS_TABLE = 'test-patients-table';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

// 2. NOW require the handler, after env vars are set
const { handler } = require('./index');

beforeEach(() => {
  ddbMock.reset();
});

test('creates a patient with valid input', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: { last_id: 7 } });
  ddbMock.on(PutCommand).resolves({});

  const result = await handler({
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Male' }),
  });

  expect(result.statusCode).toBe(201);
  const patient = JSON.parse(result.body);
  expect(patient.patient_id).toBe('W007');
  expect(patient.visit_count).toBe(0);
  expect(patient.name).toBe('John');
});

test('rejects missing name', async () => {
  const result = await handler({
    body: JSON.stringify({ age: 30, gender: 'Male' }),
  });
  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body).error).toBe('name is required');
});

test('rejects invalid age', async () => {
  const result = await handler({
    body: JSON.stringify({ name: 'John', age: -5, gender: 'Male' }),
  });
  expect(result.statusCode).toBe(400);
});

test('rejects invalid gender', async () => {
  const result = await handler({
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Unknown' }),
  });
  expect(result.statusCode).toBe(400);
});

test('returns 500 if DynamoDB fails', async () => {
  ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Male' }),
  });

  expect(result.statusCode).toBe(500);
});