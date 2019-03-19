import {Component, Input, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatCardModule, MatDividerModule, MatIconModule} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {CoreModule} from '../core/core.module';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() hasTitle = true;

  constructor(
    public activatedRoute: ActivatedRoute
  ) {
  }

  getTitle() {
    return this.activatedRoute.snapshot.data.title;
  }

  getIcon() {
    return this.activatedRoute.snapshot.data.icon;
  }
}

@NgModule({
  imports: [
    CoreModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    FlexLayoutModule
  ],
  exports: [PageHeaderComponent],
  declarations: [PageHeaderComponent],
})
export class PageHeaderModule {
}
