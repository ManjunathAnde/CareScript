// 1. Set demo env vars FIRST, before requiring the handler following strcture in handler functions
process.env.PATIENTS_TABLE = 'test-patients-table';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

// 2. NOW require the handler, after env vars are set
const { handler } = require('./index');

beforeEach(() => { //Resetting configurations after every test
  ddbMock.reset();
});

test('creates a patient with valid input', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: { last_id: 7 } }); //Mock patient id is 7, which the code reads as current patient id
  ddbMock.on(PutCommand).resolves({}); ////Let the Put succeed with an empty response , nothing for code to consume
  const result = await handler({ 
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Male' }),
  }); //Mock input from doctor going to the backend

  expect(result.statusCode).toBe(201); // Right input should return 201
  const patient = JSON.parse(result.body);
  expect(patient.patient_id).toBe('W007'); // Patient ID should be returned 7 acc to mock data
  expect(patient.visit_count).toBe(0); // First visit= visit count is zero
  expect(patient.name).toBe('John'); 
});

test('rejects missing name', async () => {
  const result = await handler({
    body: JSON.stringify({ age: 30, gender: 'Male' }),
  });
  expect(result.statusCode).toBe(400); 
  expect(JSON.parse(result.body).error).toBe('name is required'); //Missing name should return 400
});

test('rejects invalid age', async () => {
  const result = await handler({
    body: JSON.stringify({ name: 'John', age: -5, gender: 'Male' }),
  });
  expect(result.statusCode).toBe(400); //Ivalid age should return 400
});

test('rejects invalid gender', async () => {
  const result = await handler({
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Unknown' }),
  });
  expect(result.statusCode).toBe(400); //Invalid gender should return 400
});

test('returns 500 if DynamoDB fails', async () => {
  ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    body: JSON.stringify({ name: 'John', age: 30, gender: 'Male' }),
  });

  expect(result.statusCode).toBe(500);
}); //If DynamoDB connection fails, it should return 500 - internal server error