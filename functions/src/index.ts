import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BankIdClient } from 'bankid';
import { hcpPersonalNumberIsValid } from './helpers/personalNumber';
import { HcpDataAuthorizationDocument } from './typings';

admin.initializeApp();

export const hcpAuthorizeData = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    console.log('Set CORS headers and handle OPTIONS request');
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        console.log('OPTIONS method');
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
      }
    } catch (error) {
      console.error('Error in CORS region.');
      console.error(error);
    }

    if (req.method !== 'POST') {
      console.warn('Non-allowed method', req.method);
      res.sendStatus(400);
      return;
    } else {
      console.log('Method ok.');
    }

    if (!req.body) {
      console.warn('Body not available');
      res.sendStatus(400);
      return;
    } else {
      console.log('Body ok.');
    }

    if (!req.body.personalNumber) {
      console.warn('Missing personalNumber property');
      console.warn(req.body.personalNumber);
      res.sendStatus(400);
      return;
    } else {
      console.log('Personal number present.');
    }

    if (!req.body.infectedAppId) {
      console.warn('Missing infectedAppId property');
      res.sendStatus(400);
      return;
    } else {
      console.log('Infected App Id present.');
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
        console.warn('BankID signing failed');
        res.sendStatus(500);
        return;
      }
      console.log('BankID sign ok.');

      try {
        if (
          (await hcpPersonalNumberIsValid(
            bankIdResponse.completionData.user.personalNumber,
          )) === false
        ) {
          console.log('Personal number check failed.');
          res.sendStatus(403);
          return;
        }
      } catch (error) {
        console.error(error);
        return;
      }
      console.log('Personal number ok.');

      const document: HcpDataAuthorizationDocument = {
        type: 'hcp',
        infectedAppId: req.body.infectedAppId,
        bankIdCompletionData: bankIdResponse.completionData,
      };

      await admin
        .firestore()
        .collection('dataAuthorizations')
        .doc(req.body.infectedAppId)
        .set(document)
        .then(() => console.log(`Document written`))
        .catch(console.error);

      res.sendStatus(200);
    } catch (error) {
      console.error(error.name, error.message);
      res.sendStatus(500);
    }
  });

export const distributeContactEvent = functions.firestore
    .document('contactEvents')
    .onCreate((snap, context) => {
      // Get an object representing the document
      // e.g. {'name': 'Marie', 'age': 66}
      var newEvent = snap.data();
      var id = newEvent._id; // Not sure how to properly typecheck
      if (id) {

        // A topic is needed for messages 
        // for now all subscribe to "region"
        var region = "region";

        var message = {
            data: {_id: id}, 
            topic: region,
        };


        // Unable to begug since I have no Oauth2 token 
        // at least it compiles
        admin.messaging().send(message)
                .then((response) => {
                  // Response is a message ID string.
                  console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
      };
    });

