export type Identity = string;

export type Claim = {
  [subject: string]: string | Claim;
};

export type ClaimHash = string;
export type CredentialHash = string;
export type Expiration = Date | number;
