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

    const message = {
      data: {
        token: doc.token,
      },
      content_available: true,
      priority: 'high',
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error, message);
      return;
    }
  });
