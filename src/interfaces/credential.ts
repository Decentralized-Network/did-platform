export type Identity = string;

export type Claim = {
  [subject: string]: string;
};

export type ClaimHash = string;
export type CredentialHash = string;
