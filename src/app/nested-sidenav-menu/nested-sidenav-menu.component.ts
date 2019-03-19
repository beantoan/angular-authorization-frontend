import {Component, HostBinding, Input, NgModule, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';
import {NavItem} from '../core/models/nav-item.model';
import {NavService} from '../core/services/nav.service';
import {CoreModule} from '../core/core.module';
import {MatBadgeModule, MatIconModule, MatListModule, MatTooltipModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';

@Component({
  selector: 'app-nested-sidenav-menu',
  templateUrl: './nested-sidenav-menu.component.html',
  styleUrls: ['./nested-sidenav-menu.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class NestedSidenavMenuComponent implements OnInit {

  expanded: boolean;

  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;

  @Input() item: NavItem;
  @Input() depth: number;

  constructor(public navService: NavService,
              public router: Router) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item.route && url) {
        // console.log(`Checking '/${this.item.route}' against '${url}'`);
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
        // console.log(`${this.item.route} is expanded: ${this.expanded}`);
      }
    });
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
    if (item.children && item.children.length) {
      if (this.navService.expandedState.value) {
        this.expanded = !this.expanded;
      } else {
        this.expanded = true;
      }

      this.navService.openNav();
    }
  }
}


@NgModule({
  imports: [
    CoreModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  exports: [NestedSidenavMenuComponent],
  declarations: [NestedSidenavMenuComponent]
})
export class NestedSidenavMenuModule {
}
