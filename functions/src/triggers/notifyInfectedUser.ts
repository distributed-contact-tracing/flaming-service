import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const notifyInfectedUser = functions
  .region('europe-west1')
  .firestore.document('dataAuthorizations/{doc}')
  .onCreate(async (snapshot, context) => {
    const doc = snapshot.data();

    if (!doc) {
      console.error('Document read error.');
      return;
    }

    if (!doc.infectedAppId) {
      console.error('Missing app id');
      return;
    }

    const message = {
      notification: {
        title: 'New COVID-19 test result',
        body: `You've been tested positive for COVID-19. Open the app to share your data.`,
      },
      token: doc.infectedAppId,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message', response);
    } catch (error) {
      console.error('Error sending message', error, message);
    }
  });
