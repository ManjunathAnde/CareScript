process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const { handler } = require('./index');

beforeEach(() => {
  ddbMock.reset();
});

test('returns prescription history for a valid patient_id', async () => {
  ddbMock.on(QueryCommand).resolves({
    Items: [{ prescription_id: 'p1', patient_id: 'W001', status: 'pending' }],
  });

  const result = await handler({
    pathParameters: { patient_id: 'W001' },
  });

  expect(result.statusCode).toBe(200);
  const items = JSON.parse(result.body);
  expect(items.length).toBe(1);
  expect(items[0].patient_id).toBe('W001');
});

test('rejects empty patient_id', async () => {
  const result = await handler({
    pathParameters: { patient_id: '   ' },
  });
  expect(result.statusCode).toBe(400);
});

test('treats COUNTER as not found for patient history', async () => {
  const result = await handler({
    pathParameters: { patient_id: 'COUNTER' },
  });
  expect(result.statusCode).toBe(404);
});

test('returns prescriptions for a valid status query', async () => {
  ddbMock.on(QueryCommand).resolves({
    Items: [{ prescription_id: 'p2', status: 'pending' }],
  });

  const result = await handler({
    queryStringParameters: { status: 'pending' },
  });

  expect(result.statusCode).toBe(200);
});

test('rejects invalid status value', async () => {
  const result = await handler({
    queryStringParameters: { status: 'cancelled' },
  });
  expect(result.statusCode).toBe(400);
});

test('rejects request with neither path nor query param', async () => {
  const result = await handler({});
  expect(result.statusCode).toBe(400);
});

test('returns 500 if DynamoDB fails on patient history', async () => {
  ddbMock.on(QueryCommand).rejects(new Error('DynamoDB failure'));

  const result = await handler({
    pathParameters: { patient_id: 'W001' },
  });

  expect(result.statusCode).toBe(500);
});