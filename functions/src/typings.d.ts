import * as bankid from 'bankid';

interface HcpDocument {
  personalNumberHash: string;
}

interface DataAuthorizationDocument {
  type: 'hcp';
  infectedAppId: string;
}

interface HcpDataAuthorizationDocument extends DataAuthorizationDocument {
  bankIdCompletionData: bankid.CompletionData;
}
