import * as functions from 'firebase-functions';

export const fast = functions
  .region('europe-west1')
  .https.onRequest((req, res) => {
    res.send('Fast response.');
  });

export const slow = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const slowResponse = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve('Slow response.'), 5000);
      });
    };

    const responseText = await slowResponse();

    res.send(responseText);
  });
