import { IDIDManager } from './interfaces';
import { ManagerBase } from './abstract-manager';
import { IdentityController } from './identity';
import { Identity } from './interfaces/credential';

export class IdentityManager extends ManagerBase {
  constructor(did: IDIDManager) {
    super(did);
  }

  async at(identity: Identity): Promise<IdentityController> {
    return new IdentityController(this.did, identity);
  }
}
