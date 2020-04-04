import * as admin from 'firebase-admin';
import { SHA3 } from 'sha3';

export const hcpPersonalNumberIsValid = async (
  personalNumber: string,
): Promise<boolean> => {
  const hash = personalNumberHash(personalNumber);

  try {
    const result = await admin
      .firestore()
      .collection('hcps')
      .where('personalNumberHash', '==', hash)
      .limit(1)
      .get();

    if (result.docs.length !== 1) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export const personalNumberHash = (personalNumber: string) => {
  const hash = new SHA3(512);

  hash.update(personalNumber);

  return hash.digest('hex');
};
