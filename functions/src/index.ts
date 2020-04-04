import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BankIdClient } from 'bankid';
import { hcpPersonalNumberIsValid } from './helpers/personalNumber';
import { HcpDataAuthorizationDocument } from './typings';

admin.initializeApp();

export const hcpAuthorizeData = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    if (
      req.method !== 'POST' ||
      !req.body ||
      !req.body.personalNumber ||
      !req.body.infectedAppId
    ) {
      res.sendStatus(400);
      return;
    }

    const client = new BankIdClient();

    try {
      const bankIdResponse = await client.signAndCollect({
        personalNumber: req.body.personalNumber,
        userVisibleData:
          'Jag intygar härmed att personen med ID:\n\n' +
          req.body.infectedAppId +
          '\n\ni My Shared Air-appen har testats positivt för covid-19.',
        userNonVisibleData: req.body.infectedAppId,
        endUserIp: '127.0.0.1',
      });

      if (!bankIdResponse || !bankIdResponse.completionData) {
        res.sendStatus(500);
        return;
      }

      try {
        if (
          (await hcpPersonalNumberIsValid(
            bankIdResponse.completionData.user.personalNumber,
          )) === false
        ) {
          res.sendStatus(403);
          return;
        }
      } catch (error) {
        console.error(error);
        return;
      }

      const document: HcpDataAuthorizationDocument = {
        type: 'hcp',
        infectedAppId: req.body.infectedAppId,
        bankIdCompletionData: bankIdResponse.completionData,
      };

      await admin
        .firestore()
        .collection('dataAuthorizations')
        .add(document)
        .then((documentReference) => {
          console.log(`Added document with name: ${documentReference.id}`);
        })
        .catch(console.error);

      res.sendStatus(200);
    } catch (error) {
      console.error(error.name, error.message);
      res.sendStatus(500);
    }
  });
