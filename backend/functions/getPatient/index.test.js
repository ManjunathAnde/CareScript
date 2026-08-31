process.env.PATIENTS_TABLE = 'test-patients-table'; //Fake value for table reference

const { mockClient } = require('aws-sdk-client-mock'); //Mock to intercept functions calling real AWS resources
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index'); //unmodified lambda function which is being tested

beforeEach(() => { // Before each test, reset any previous test configurations
  ddbMock.reset();
});

//resolves - pretend this is successfull and handing response demo data
//rejects - pretend this threw an error with specific cause

test('returns patient when found', async () => { //String label {name of the test}
  ddbMock.on(GetCommand).resolves({ //Do not access real DynamoDB. Intercept and hand this response
    Item: { patient_id: 'W001', name: 'John', age: 30, gender: 'Male', visit_count: 2 },
  }); //Scripted data that the test output should match

  const result = await handler({ //calling the handler function with a demo path parameter
    pathParameters: { id: 'W001' },
  });

  expect(result.statusCode).toBe(200); //Handler should return HTTP status 200 : happypath
  const patient = JSON.parse(result.body);
  expect(patient.patient_id).toBe('W001'); //Confirms handler doesn't alter mocked patient_id
  expect(patient.visit_count).toBe(2); //Confirms handler doesn't alter mocked visit_count
});

test('rejects missing id', async () => {
  const result = await handler({ pathParameters: {} });
  expect(result.statusCode).toBe(400); //missing patient id should return 400 status code
});

test('rejects id missing entirely (no pathParameters)', async () => {
  const result = await handler({});
  expect(result.statusCode).toBe(400); //no path parameter extracted should return 400
});

test('treats COUNTER as not found', async () => {
  const result = await handler({
    pathParameters: { id: 'COUNTER' },
  });
  expect(result.statusCode).toBe(404); //Attempts to reach counter should return 400
});

test('returns 404 when patient does not exist', async () => {
  ddbMock.on(GetCommand).resolves({ Item: undefined });

  const result = await handler({
    pathParameters: { id: 'W999' }, //Absence of patient should result 404
  });

  expect(result.statusCode).toBe(404);
});

test('returns 500 if DynamoDB fails', async () => {
  ddbMock.on(GetCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    pathParameters: { id: 'W001' },
  });

  expect(result.statusCode).toBe(500); // DynamoDB error should return 500
});