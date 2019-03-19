import {Component, Input, NgModule, OnInit} from '@angular/core';
import {MatButtonModule, MatIconModule, MatMenuModule, MatSnackBar, MatSnackBarModule, MatToolbarModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AngularTokenService, UserData} from 'angular-token';
import {UserService} from '../core/services/user.service';
import {Logger} from '../core/utils/logger';
import {MessageComponent} from '../message/message.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NavService} from '../core/services/nav.service';
import {TranslateModule} from '@ngx-translate/core';
import {ShowAuthedDirectiveModule} from '../core/directives/show-authed.directive';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  currentUser: UserData;

  @Input() title: string;

  constructor(
    private userService: UserService,
    private tokenService: AngularTokenService,
    private snackBar: MatSnackBar,
    public navService: NavService
  ) {
  }

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  onLogoutClicked() {
    this.tokenService.signOut().subscribe(
      next => {},
      error => {},
      () => {
        Logger.info(UserService.name, 'onLogoutClicked', 'signed out');

        this.userService.emitUserData(true);

        this.snackBar.openFromComponent(MessageComponent, {
          duration: 2000,
          data: {type: MessageComponent.TYPE_SUCCESS, content: 'message.logout_success'}
        });
      }
    );
  }

}

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    FlexLayoutModule,
    TranslateModule,
    ShowAuthedDirectiveModule
  ],
  exports: [
    TopBarComponent
  ],
  declarations: [
    TopBarComponent
  ]
})
export class TopBarModule {
}

