import * as admin from 'firebase-admin';

admin.initializeApp();

export { hcpAuthorizeData } from './http/hcpAuthorizeData';

// export { emitCreatedContactEvent } from './firestore/emitCreatedContactEvent';
export { notifyInfectedUser } from './firestore/notifyInfectedUser';
