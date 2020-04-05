import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const emitCreatedContactEvent = functions
  .region('europe-west1')
  .firestore.document('contactEvents/{event}')
  .onCreate(async (snap, context) => {
    const doc = snap.data();

    if (!doc) {
      console.error('No doc reference.');
      return;
    }

    if (!doc.token) {
      console.error("Document doesn't have a token.");
      return;
    }

    const topic = 'region'; // Catch-all region for now

    /* Legacy data */
    const payload = {
      data: {
        function: 'sendToTopic',
        token: doc.token,
      },
    };

    const options = {
      contentAvailable: true,
      priority: 'high',
    };

    /* New data */
    const message = {
      data: {
        function: 'send',
        token: doc.token,
      },
      apns: {
        headers: {
          'apns-push-type': 'background',
          'apns-priority': '5',
          'apns-topic': '',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message using send():', response);

      const legacyResponse = await admin
        .messaging()
        .sendToTopic(topic, payload, options);
      console.log(
        'Successfully sent message using legacy sendToTopic():',
        legacyResponse,
      );
    } catch (error) {
      console.error('Error sending message:', error);
      return;
    }
  });
