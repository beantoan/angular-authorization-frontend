import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';
import {Logger} from './core/utils/logger';
import {Location} from '@angular/common';
import {RoutingStateService} from './core/services/routing-state.service';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {AngularTokenService, UserData} from 'angular-token';
import {finalize} from 'rxjs/operators';
import {MessageUtil} from './core/utils/message.util';
import {MessageComponent} from './message/message.component';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {RoleService} from './core/services/role.service';
import {AppEventEmitter} from './core/services/app-event-emitter.service';
import {NavService} from './core/services/nav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  appTitle = environment.title;
  currentUser: UserData;

  private loginPath = '/login';

  public constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private navService: NavService,
    private titleService: Title,
    private location: Location,
    private routingState: RoutingStateService,
    private tokenService: AngularTokenService,
    private media: MediaObserver,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private appEventEmitter: AppEventEmitter,
  ) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    translate.use('vi');
  }

  ngOnInit(): void {
    Logger.info(AppComponent.name, 'ngOnInit');

    this.routingState.subscribeHistories();

    this.subscribeEvents();

    this.titleService.setTitle(environment.title);

    this.validateToken();
  }

  /**
   * Need to validate token when a page is initialized
   */
  private validateToken() {
    if (!this.tokenService.currentUserData && this.tokenService.userSignedIn()) {
      Logger.info(UserService.name, 'validateToken', 'Need to call validateToken()');

      this.appEventEmitter.loadingState.next(true);

      this.tokenService.validateToken().pipe(
        finalize(() => {
          this.userService.emitUserData();
          this.subscribeUserServices();

          this.roleService.getMyRole().subscribe(data => {
            this.userService.setCurrentUserRole(data);
          });

          this.appEventEmitter.loadingState.next(false);
        })
      ).subscribe(
        data => {
        },
        res => {
          const msg = MessageUtil.getErrorMessage(res, 'message.user_has_been_logged_out');

          this.snackBar.openFromComponent(MessageComponent, {
            duration: 5000,
            data: {type: MessageComponent.TYPE_ERROR, content: msg}
          });
        }
      );
    } else {
      this.subscribeUserServices();
    }
  }

  private subscribeUserServices() {
    Logger.info(AppComponent.name, 'subscribeUserServices');

    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        if (authenticated) {
          let previousUrl = this.routingState.getPreviousUrl();

          Logger.info(AppComponent.name, 'subscribeUserServices',
            'User logged in', `previousUrl=${previousUrl}`);

          if (this.isLoginPage(previousUrl)) {
            previousUrl = this.routingState.getHistory()[0];
          }

          Logger.info(AppComponent.name, 'subscribeUserServices',
            `previousUrl=${previousUrl}`);

          this.router.navigateByUrl(previousUrl).then(value => {
            Logger.info(AppComponent.name, 'subscribeUserServices',
              `navigateByUrl: value=${value}`);
          });
        } else {
          Logger.error(AppComponent.name, 'subscribeUserServices',
            'User was not logged in');

          this.router.navigateByUrl(this.loginPath).then(value => {
            Logger.info(AppComponent.name, 'subscribeUserServices',
              `navigateByUrl: value=${value}`);
          });
        }
      }
    );

    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  /**
   * Subscribe the events of router
   */
  private subscribeEvents() {
    Logger.info(AppComponent.name, 'subscribeEvents');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        Logger.info(AppComponent.name, 'subscribeEvents', event);

        const title = this.analyzeActiveRoute(this.router.routerState.snapshot.root);
        const titleParts = title.split('|');

        if (titleParts.length === 2) {
          this.translate.get(titleParts[1].trim()).subscribe(text => {
            this.titleService.setTitle(`${environment.title} | ${text}`);
          });
        } else {
          this.titleService.setTitle(title);
        }

        const isLoginPage = this.isLoginPage(event.urlAfterRedirects);

        this.switchPageLayout(isLoginPage);
      }
    });

    this.media.media$.subscribe((change: MediaChange) => {
      this.navService.closeNav();
    });
  }

  private isLoginPage(pageUrl: string): boolean {
    return pageUrl.startsWith(this.loginPath);
  }

  /**
   * Switch page layout between login page and normal page
   *
   * @param isLoginPage: boolean
   */
  private switchPageLayout(isLoginPage: boolean) {
    if (!isLoginPage || this.media.isActive('lt-md')) {
      this.appTitle = environment.title;
    } else {
      this.appTitle = environment.appName;
    }
  }

  /**
   * Analyze the route
   *
   * @returnUrl [isLoginPage: boolean, title: string]
   */
  private analyzeActiveRoute(snapshot: ActivatedRouteSnapshot): string {
    if (snapshot) {
      if (snapshot.firstChild) {
        return this.analyzeActiveRoute(snapshot.firstChild);
      }

      if (snapshot.data.title) {
        return `${environment.title} | ${snapshot.data.title}`;
      }
    }

    return environment.title;
  }
}
