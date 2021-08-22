import { IDIDManager } from './interfaces';
import { ManagerBase } from './abstract-manager';

export class IdentityManager extends ManagerBase {
  constructor(did: IDIDManager) {
    super(did);
  }

  async at(identity: Identity): Promise<Identity> {

  }
}
