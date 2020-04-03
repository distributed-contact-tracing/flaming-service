import * as functions from 'firebase-functions';
import { BankIdClient } from 'bankid';

export const authorizeData = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    if (req.body && req.body.personalNumber && req.body.appIdentifier) {
      const client = new BankIdClient();

      try {
        const result = await client.signAndCollect({
          personalNumber: req.body.personalNumber,
          userVisibleData:
            'Jag intygar härmed att personen med ID:\n\n' +
            req.body.appIdentifier +
            '\n\ni Distributed Contact Tracing-appen har testats positivt för covid-19.',
          userNonVisibleData: req.body.appIdentifier,
          endUserIp: '127.0.0.1',
        });

        res.status(200).send({ completionData: result.completionData });
      } catch (error) {
        console.error(error.name, error.message);
        res.sendStatus(500);
      }
    } else {
      console.error(
        'Error: Bad request. req.body = ',
        JSON.stringify(req.body),
      );
      res.sendStatus(400);
    }
  });
