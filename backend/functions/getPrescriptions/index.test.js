process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index');

beforeEach(() => { // Resets configurations before each test
  ddbMock.reset();
});

test('returns prescription history for a valid patient_id', async () => {
  ddbMock.on(QueryCommand).resolves({
    Items: [{ prescription_id: 'p1', patient_id: 'W001', status: 'pending' }],
  }); //Items - Plural because QueryCommand can return multiple rows . Hence always returns array

  //QueryCommand finds all entries by the specific partition key, filtered by the sorting key. 

  const result = await handler({
    pathParameters: { patient_id: 'W001' },
  }); //Testing execution of path parameter lookup of patient history

  expect(result.statusCode).toBe(200);
  const items = JSON.parse(result.body);
  expect(items.length).toBe(1); //Test to check if exactly one prescription got returned
  expect(items[0].patient_id).toBe('W001');
}); //Checks if the handler function is not altering the data

test('rejects empty patient_id', async () => {
  const result = await handler({
    pathParameters: { patient_id: '   ' },
  });
  expect(result.statusCode).toBe(400);
}); //Empty patient id should return error 400

test('treats COUNTER as not found for patient history', async () => {
  const result = await handler({
    pathParameters: { patient_id: 'COUNTER' },
  });
  expect(result.statusCode).toBe(404);
}); //Search for counter should return error 404

test('returns prescriptions for a valid status query', async () => {
  ddbMock.on(QueryCommand).resolves({
    Items: [{ prescription_id: 'p2', status: 'pending' }],
  });

  const result = await handler({
    queryStringParameters: { status: 'pending' },
  }); 

  expect(result.statusCode).toBe(200); //pending is a valid query parameter - happy path
});

test('rejects invalid status value', async () => {
  const result = await handler({
    queryStringParameters: { status: 'cancelled' },
  });
  expect(result.statusCode).toBe(400); //Any query paramater except pending or dispensed should return error 400
});

test('rejects request with neither path nor query param', async () => {
  const result = await handler({});
  expect(result.statusCode).toBe(400);
}); //No query or path paramter should return 400

test('returns 500 if DynamoDB fails on patient history', async () => {
  ddbMock.on(QueryCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    pathParameters: { patient_id: 'W001' },
  });

  expect(result.statusCode).toBe(500);
}); // DynamoDB connection error should return error 500