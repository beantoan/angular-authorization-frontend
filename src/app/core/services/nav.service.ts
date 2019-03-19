import {Injectable} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {MatSidenav} from '@angular/material';
import {MediaObserver} from '@angular/flex-layout';

@Injectable()
export class NavService {
  public appDrawer: any | MatSidenav;
  public currentUrl = new BehaviorSubject<string>(undefined);
  public expandedState = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private media: MediaObserver
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.next(event.urlAfterRedirects);

        this.closeNav();
      }
    });
  }

  public closeNav() {
    if (this.media.isActive('lt-sm')) {
      if (this.appDrawer) {
        this.appDrawer.close();
      }
    } else {
      if (this.appDrawer) {
        this.appDrawer.mode = 'side';
        this.appDrawer.open();
      }

      this.expandedState.next(false);
    }
  }

  public openNav() {
    this.expandedState.next(true);

    if (this.appDrawer) {
      this.appDrawer.open();

      if (this.media.isActive('lt-sm')) {
        this.appDrawer.mode = 'over';
      } else {
        this.appDrawer.mode = 'side';
      }
    }
  }

  public toggleNav() {
    if (this.media.isActive('lt-sm')) {
      this.expandedState.next(true);
      this.appDrawer.toggle();
      this.appDrawer.mode = 'over';
    } else {
      this.appDrawer.mode = 'side';
      this.expandedState.next(this.appDrawer.opened ? !this.expandedState.value : true);
      this.appDrawer.open();
    }
  }
}
