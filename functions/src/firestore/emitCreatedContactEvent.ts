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

    const payload = {
      data: {
        token: doc.token,
      },
    };

    const options = {
      contentAvailable: true,
      priority: 'high',
    };

    try {
      const response = await admin
        .messaging()
        .sendToTopic(topic, payload, options);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
      return;
    }
  });
