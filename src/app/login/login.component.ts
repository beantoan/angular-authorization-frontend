import {Component, NgModule, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/services/user.service';
import {Router} from '@angular/router';
import {Logger} from '../core/utils/logger';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSnackBar
} from '@angular/material';
import {CoreModule} from '../core/core.module';
import {AngularTokenService} from 'angular-token';
import {MessageComponent} from '../message/message.component';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {finalize} from 'rxjs/operators';
import {MessageUtil} from '../core/utils/message.util';
import {RoleService} from '../core/services/role.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private tokenService: AngularTokenService,
    private snackBar: MatSnackBar,
    private appEventEmitter: AppEventEmitter
  ) {
  }

  ngOnInit() {
      this.buildLoginForm();
  }

  private buildLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required, Validators.email
      ]),
      password: new FormControl('', Validators.required),
    });
  }

  submitForm() {
    Logger.info(LoginComponent.name, 'submitForm', this.loginForm.value);

    this.appEventEmitter.loadingState.next(true);

    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;

      const signInData = {
        login: formValue.email,
        password: formValue.password
      };

      this.tokenService.signIn(signInData)
        .pipe(finalize(() => {
          Logger.info(LoginComponent.name, 'submitForm', 'signed in completed');
          this.userService.emitUserData();
          this.appEventEmitter.loadingState.next(false);

          this.roleService.getMyRole().subscribe(data => {
            this.userService.setCurrentUserRole(data);
          });
        }))
        .subscribe(
          res => {
            Logger.info(LoginComponent.name, 'submitForm', this.tokenService.currentUserData);

            this.snackBar.openFromComponent(MessageComponent, {
              duration: 2000,
              data: { type: MessageComponent.TYPE_SUCCESS, content: 'message.login_success' }
            });
          },
          res => {
            Logger.error(LoginComponent.name, 'submitForm', res.error);

            const msg = MessageUtil.getErrorMessage(res, 'message.login_error');

            this.snackBar.openFromComponent(MessageComponent, {
              duration: 5000,
              data: { type: MessageComponent.TYPE_ERROR, content: msg }
            });
          }, () => {

          }
        );
    } else {
      this.appEventEmitter.loadingState.next(false);

      this.snackBar.openFromComponent(MessageComponent, {
        duration: 5000,
        data: { type: MessageComponent.TYPE_ERROR, content: 'login.username_password_blank_error' }
      });
    }
  }
}

@NgModule({
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    FlexLayoutModule
  ],
  exports: [LoginComponent],
  declarations: [LoginComponent],
})
export class LoginModule {
}

