process.env.PRESCRIPTIONS_TABLE = 'test-prescriptions-table';
process.env.SES_FROM_EMAIL = 'test@example.com'; //env var for sender's address

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb'); // Client to talk to DynamoDB
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses'); // Client to talk to SES

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);

const { handler } = require('./index');

beforeEach(() => { //Resets configurations before each test
  ddbMock.reset();
  sesMock.reset();
});

const updatedPrescription = {
  prescription_id: 'p1',
  patient_id: 'W001',
  patient_name: 'John',
  status: 'dispensed',
  medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'twice daily' }],
};//Shared mock data for tests. 
//This object has to be complete because handler function returns all values.
//buildEmailbody needs all fields for constructing email

test('marks prescription dispensed with no email', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });//Testing successful dispense without any email sent
// It needs both identifying path parameter - to find prescription id {UUID} and body telling it to mark prescription as dispensed

  const result = await handler({
    pathParameters: { prescription_id: 'p1' }, //API Gateway, on passing this to handler, extracts path parameter and hands it to lambda 
    body: JSON.stringify({ status: 'dispensed' }), //Mark the prescription as dispensed - PATCH Request
  });

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.status).toBe('dispensed');
  expect(body.email_sent).toBeUndefined(); //Email wasnt passed to handler, hence email_sent is undefined
});

test('marks prescription dispensed and sends email successfully', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });
  sesMock.on(SendEmailCommand).resolves({}); //Pretend sending email succeeded

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed', email: 'patient@example.com' }),// mock reciepent email
  });

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.email_sent).toBe(true); //Successful email sent should return 200
});

test('marks dispensed successfully even if email sending fails', async () => {
  ddbMock.on(UpdateCommand).resolves({ Attributes: updatedPrescription });
  sesMock.on(SendEmailCommand).rejects(new Error('SES failure'));

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed', email: 'patient@example.com' }),
  });

  expect(result.statusCode).toBe(200); // A failure of sending email should return 200 if database update succeeds.
  const body = JSON.parse(result.body);
  expect(body.email_sent).toBe(false);
});

test('rejects missing prescription_id', async () => {
  const result = await handler({
    pathParameters: {},
    body: JSON.stringify({ status: 'dispensed' }), //Missing path paramter : missing prescription ID
  });
  expect(result.statusCode).toBe(400); //Absence of patient ID should return 400
});

test('rejects status other than dispensed', async () => {
  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'cancelled' }), //Only two valid statuses : dispensed or pending
  });
  expect(result.statusCode).toBe(400);
});


//If the status of prescription is not pending, we proceed to looking why in database.
// We first check if {prescription id not found} then we check if status is already {dispensed}
// Other errors would return {invalid prescripion state}

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
}); //Invalid prescription_id

test('returns 409 when prescription already dispensed', async () => {
  const condError = new Error('conditional check failed');
  condError.name = 'ConditionalCheckFailedException';
  ddbMock.on(UpdateCommand).rejects(condError); //Rejects condition and throws error to handler
  ddbMock.on(GetCommand).resolves({ Item: { ...updatedPrescription, status: 'dispensed' } });

  const result = await handler({
    pathParameters: { prescription_id: 'p1' },
    body: JSON.stringify({ status: 'dispensed' }),
  });

  expect(result.statusCode).toBe(409);
  const body = JSON.parse(result.body);
  expect(body.error).toBe('Prescription already dispensed');
}); //Prescription already dispensed should return 409

//The Update's condition checks BOTH existence AND pending status together {conditional transaction}.
// if either fails, DynamoDB throws the same exception.
// so we do a follow-up lookup to find out which.