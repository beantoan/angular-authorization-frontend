import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class AppEventEmitter {
  loadingState = new EventEmitter(true);
  onSectionSaved = new EventEmitter(true);
  onRoleSaved = new EventEmitter(true);
  onUserSaved = new EventEmitter(true);
}
