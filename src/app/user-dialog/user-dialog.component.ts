import {Component, Inject, NgModule, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInput,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Logger} from '../core/utils/logger';
import {CoreModule} from '../core/core.module';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {User} from '../core/models/user.model';
import {UserService} from '../core/services/user.service';
import {MessageComponent} from '../message/message.component';
import {finalize} from 'rxjs/operators';
import {Role} from '../core/models/role.model';
import {RoleService} from '../core/services/role.service';
import {Observable} from 'rxjs';
import {MessageUtil} from '../core/utils/message.util';
import {CommonType} from '../core/models/common-type.model';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
  providers: []
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;

  isSubmitting = false;

  private savedUserData: {} = null;
  statuses: Observable<CommonType[]>;
  roles: Observable<Role[]>;
  translateParams: {};

  @ViewChild('nameInput') nameInput: MatInput;

  constructor(
    private snackBar: MatSnackBar,
    private userService: UserService,
    private roleService: RoleService,
    @Inject(MAT_DIALOG_DATA) public data = {} as User,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private appEventEmitter: AppEventEmitter
  ) {
  }

  ngOnInit() {
    this.buildUserForm();

    this.initData();
  }

  private initData() {
    this.statuses = this.userService.statuses();
    this.roles = this.roleService.getAll();
  }

  private getUserFormData() {
    const data = this.userForm.value;

    if (this.isEditUser()) {
      data.id = this.data.id;
    }

    return data;
  }

  private createOrUpdateUser() {
    Logger.info(UserDialogComponent.name, 'createOrUpdateUser', this.userForm.value);

    this.isSubmitting = true;

    this.savedUserData = null;

    if (this.userForm.valid) {
      const userData = this.getUserFormData();

      const observable = this.isEditUser() ?
        this.userService.update(userData) : this.userService.create(userData);

      observable
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        ).subscribe(
        data => {
          this.savedUserData = userData;

          this.resetForm();

          this.snackBar.openFromComponent(MessageComponent, {
            duration: 5000,
            data: {type: MessageComponent.TYPE_SUCCESS, content: data.msg}
          });

          this.appEventEmitter.onUserSaved.next(true);
        },
        res => {
          Logger.info(UserDialogComponent.name, 'createOrUpdateUser', res);

          const msg = MessageUtil.getErrorMessage(res);

          this.snackBar.openFromComponent(MessageComponent, {
            duration: 5000,
            data: {type: MessageComponent.TYPE_ERROR, content: msg}
          });
        });
    } else {
      this.setFormFieldsAsTouched();

      this.snackBar.openFromComponent(MessageComponent, {
        duration: 5000,
        data: {
          type: MessageComponent.TYPE_ERROR,
          content: 'message.enter_required_information'
        }
      });

      this.isSubmitting = false;
    }
  }

  private setFormFieldsAsTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.controls[key].markAsTouched();
    });
  }

  isEditUser() {
    return this.data && this.data.id;
  }

  private resetForm() {
    if (!this.isEditUser()) {
      this.userForm.reset();
    }

    this.nameInput.focus();
  }

  private buildUserForm() {

    let nameVal = '';
    let emailVal = '';
    let passwordVal = null;
    let roleIdVal = null;
    let statusVal = UserService.STATUS_ACTIVE;

    if (this.data) {
      roleIdVal = this.data.role ? this.data.role.id : null;
      statusVal = this.data.status;
    }

    if (this.isEditUser()) {
      nameVal = this.data.name;
      emailVal = this.data.email;
      passwordVal = null;
    } else {
      passwordVal = Math.random().toString(36).substring(2, 10);
    }

    this.userForm = new FormGroup({
      name: new FormControl(nameVal, {
        validators: [Validators.required]
      }),
      email: new FormControl(emailVal, {
        validators: [Validators.required]
      }),
      password: new FormControl(passwordVal),
      role_id: new FormControl(roleIdVal, {
        validators: [Validators.required]
      }),
      status: new FormControl(statusVal, {
        validators: [Validators.required]
      })
    });
  }

  onSaveUserClicked() {
    this.createOrUpdateUser();
  }

  onCloseDialogClicked() {
    Logger.info(UserDialogComponent.name, 'onCloseDialogClicked', this.savedUserData);

    this.dialogRef.close(this.savedUserData);
  }

  getTitle() {
    this.translateParams = {title: this.data ? this.data.name : null};

    return this.isEditUser() ? 'user.edit_dialog_title' : 'user.new_dialog_title';
  }
}

@NgModule({
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    FlexLayoutModule
  ],
  exports: [UserDialogComponent],
  declarations: [UserDialogComponent],
  entryComponents: [UserDialogComponent]
})
export class UserDialogModule {
}
