import * as functions from 'firebase-functions';

export const registerNewUserDeviceId = functions
  .region('europe-west1')
  .auth.user()
  .onCreate((user) => {
    try {
      //Retrieve and store device ID here

      console.log('Successfully saved device registration token');
    } catch (error) {
      console.error('Error saving device registration token message:', error);
      return;
    }
  });
