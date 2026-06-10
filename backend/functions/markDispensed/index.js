const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const PRESCRIPTIONS_TABLE = process.env.PRESCRIPTIONS_TABLE;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function buildEmailBody(item) {
  const medLines = Array.isArray(item.medications)
    ? item.medications.map((m) => `  • ${m.name} ${m.dosage} (${m.frequency})`).join('\n')
    : '  (no medications listed)';

  return [
    `Dear ${item.patient_name},`,
    '',
    'Your prescription has been dispensed and your medicines are ready for collection at PrimeCare Health.',
    '',
    '──────────────────────────',
    'PRESCRIPTION DETAILS',
    '──────────────────────────',
    '',
    `Prescription ID : ${item.prescription_id}`,
    '',
    '──────────────────────────',
    'PATIENT DETAILS',
    '──────────────────────────',
    '',
    `Patient ID   : ${item.patient_id}`,
    `Patient Name : ${item.patient_name}`,
    '',
    '──────────────────────────',
    'MEDICINES DISPENSED',
    '──────────────────────────',
    '',
    medLines,
    '',
    '──────────────────────────',
    '',
    'Please visit the pharmacy counter to collect your medicines.',
    '',
    `Bring this email or quote your Patient ID (${item.patient_id}) when collecting your prescription.`,
    '',
    'For any queries, contact PrimeCare Health directly.',
    '',
    '──────────────────────────',
    'PrimeCare Health',
    'Powered by CareScript',
    '──────────────────────────',
    '',
    'This is an automated notification. Please do not reply.',
  ].join('\n');
}

exports.handler = async (event) => {
  const rawPrescriptionId = event.pathParameters && event.pathParameters.prescription_id;
  const prescriptionId = typeof rawPrescriptionId === 'string' ? rawPrescriptionId.trim() : '';

  if (!prescriptionId) {
    return respond(400, { error: 'prescription_id is required' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid request body' });
  }

  const { status, email } = body;
  const recipientEmail = typeof email === 'string' ? email.trim() : '';

  if (status !== 'dispensed') {
    return respond(400, { error: 'status must be dispensed' });
  }

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: PRESCRIPTIONS_TABLE,
      Key: { prescription_id: prescriptionId },
      UpdateExpression: 'SET #s = :dispensed',
      ConditionExpression: 'attribute_exists(prescription_id) AND #s = :pending',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':dispensed': 'dispensed',
        ':pending': 'pending',
      },
      ReturnValues: 'ALL_NEW',
    }));

    if (recipientEmail) {
      try {
        await sesClient.send(new SendEmailCommand({
          Source: `CareScript Notifications <${SES_FROM_EMAIL}>`,
          Destination: { ToAddresses: [recipientEmail] },
          Message: {
            Subject: { Data: 'CareScript Prescription Confirmation', Charset: 'UTF-8' },
            Body: {
              Text: { Data: buildEmailBody(result.Attributes), Charset: 'UTF-8' },
            },
          },
        }));
        return respond(200, { prescription_id: prescriptionId, status: 'dispensed', email_sent: true });
      } catch (sesErr) {
        console.error(JSON.stringify({
          event: 'SES_SEND_FAILED',
          prescriptionId,
          recipientEmail,
          error: sesErr.message || String(sesErr),
          errorCode: sesErr.name,
        }));
        return respond(200, { prescription_id: prescriptionId, status: 'dispensed', email_sent: false });
      }
    }

    return respond(200, {
      prescription_id: prescriptionId,
      status: 'dispensed',
    });

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      try {
        const lookup = await docClient.send(new GetCommand({
          TableName: PRESCRIPTIONS_TABLE,
          Key: { prescription_id: prescriptionId },
        }));

        if (!lookup.Item) {
          return respond(404, { error: 'Prescription not found' });
        }

        if (lookup.Item.status === 'dispensed') {
          return respond(409, { error: 'Prescription already dispensed' });
        }

        return respond(409, { error: 'Invalid prescription state' });

      } catch (lookupErr) {
        console.error('Lookup after ConditionalCheckFailedException failed:', lookupErr);
        return respond(500, { error: 'Internal server error' });
      }
    }

    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
};
