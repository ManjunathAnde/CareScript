process.env.PATIENTS_TABLE = 'test-patients-table'; //Fake value for table reference

const { mockClient } = require('aws-sdk-client-mock'); //Mock to intercept functions calling real AWS resources
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index'); //unmodified lambda function which is being tested

beforeEach(() => { // Before each test, reset any previous test configurations
  ddbMock.reset();
});

test('returns patient when found', async () => { //String label {name of the test}
  ddbMock.on(GetCommand).resolves({ //Do not access real DynamoDB. Intercept and hand this response
    Item: { patient_id: 'W001', name: 'John', age: 30, gender: 'Male', visit_count: 2 },
  });

  const result = await handler({ //calling the handler function with a demo path parameter
    pathParameters: { id: 'W001' },
  });

  expect(result.statusCode).toBe(200);
  const patient = JSON.parse(result.body);
  expect(patient.patient_id).toBe('W001');
  expect(patient.visit_count).toBe(2);
});

test('rejects missing id', async () => {
  const result = await handler({ pathParameters: {} });
  expect(result.statusCode).toBe(400);
});

test('rejects id missing entirely (no pathParameters)', async () => {
  const result = await handler({});
  expect(result.statusCode).toBe(400);
});

test('treats COUNTER as not found', async () => {
  const result = await handler({
    pathParameters: { id: 'COUNTER' },
  });
  expect(result.statusCode).toBe(404);
});

test('returns 404 when patient does not exist', async () => {
  ddbMock.on(GetCommand).resolves({ Item: undefined });

  const result = await handler({
    pathParameters: { id: 'W999' },
  });

  expect(result.statusCode).toBe(404);
});

test('returns 500 if DynamoDB fails', async () => {
  ddbMock.on(GetCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    pathParameters: { id: 'W001' },
  });

  expect(result.statusCode).toBe(500);
});