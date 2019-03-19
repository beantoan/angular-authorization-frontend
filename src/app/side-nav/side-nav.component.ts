import {AfterViewInit, Component, ElementRef, Input, NgModule, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../core/services/user.service';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBar,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ShowAuthedDirectiveModule} from '../core/directives/show-authed.directive';
import {FlexLayoutModule} from '@angular/flex-layout';
import {environment} from '../../environments/environment';
import {AngularTokenService, UserData} from 'angular-token';
import {Logger} from '../core/utils/logger';
import {MessageComponent} from '../message/message.component';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {NavItem} from '../core/models/nav-item.model';
import {NavService} from '../core/services/nav.service';
import {NestedSidenavMenuModule} from '../nested-sidenav-menu/nested-sidenav-menu.component';
import {TopBarModule} from '../top-bar/top-bar.component';
import {FooterModule} from '../footer/footer.component';
import {TranslateModule} from '@ngx-translate/core';
import {RoleUtil} from '../core/utils/role.util';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  providers: [],
})
export class SideNavComponent implements OnInit, AfterViewInit {
  currentUser: UserData;
  footerTitle = environment.appName;

  isLoading = false;

  @Input() title: string;
  @Input() appTitle = environment.appName;
  @ViewChild('appDrawer') appDrawer: ElementRef;

  navItems: NavItem[] = [];

  private fullNavItems: NavItem[] = [
    {
      displayName: 'menu.configurations',
      iconName: 'settings',
      children: [
        {
          displayName: 'menu.accounts',
          iconName: 'person',
          route: '/accounts',
          section: 'api_users',
          rule: 'index'
        },
        {
          displayName: 'menu.groups',
          iconName: 'group',
          route: '/groups',
          section: 'api_roles',
          rule: 'index'
        },
        {
          displayName: 'menu.features',
          iconName: 'security',
          route: '/features',
          section: 'api_sections',
          rule: 'index'
        },
      ]
    }
  ];

  constructor(
    private userService: UserService,
    private tokenService: AngularTokenService,
    private snackBar: MatSnackBar,
    private appEventEmitter: AppEventEmitter,
    public navService: NavService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
    this.subscribeEvents();
  }

  private subscribeEvents() {
    Logger.info(SideNavComponent.name, 'subscribeEvents');

    this.userService.currentUser.subscribe(userData => {
      this.currentUser = userData;
    });

    this.userService.currentUserRole.subscribe(role => {
      this.navItems = RoleUtil.getNavItemsByRole(role, this.fullNavItems);
    });

    this.appEventEmitter.loadingState.subscribe(value => {
      Logger.info(SideNavComponent.name, 'subscribeEvents', 'appEventEmitter.loadingState.subscribe', value);
      this.isLoading = value;
    }, err => {
      Logger.error(SideNavComponent.name, 'subscribeEvents', 'appEventEmitter.loadingState.subscribe error', err);
      this.isLoading = false;
    });

  }

  onLogoutClicked() {
    this.tokenService.signOut().subscribe(
      next => {
      },
      error => {
      },
      () => {
        Logger.info(UserService.name, 'onLogoutClicked', 'signed out');

        this.userService.emitUserData(true);

        this.snackBar.openFromComponent(MessageComponent, {
          duration: 2000,
          data: {
            type: MessageComponent.TYPE_SUCCESS,
            content: 'message.logout_success'
          }
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
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    FlexLayoutModule,
    NestedSidenavMenuModule,
    TopBarModule,
    FooterModule,
    TranslateModule,
    ShowAuthedDirectiveModule
  ],
  exports: [
    SideNavComponent
  ],
  declarations: [
    SideNavComponent
  ],
})
export class SideNavModule {
}
