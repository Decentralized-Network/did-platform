import { IDIDManager } from './interfaces';
import { ManagerBase } from './abstractManager';

export class IdentityManager extends ManagerBase {
  constructor(did: IDIDManager) {
    super(did);
  }
}
