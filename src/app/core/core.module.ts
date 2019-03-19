import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ApiService} from './services/api.service';
import {RouterModule} from '@angular/router';
import {RoutingStateService} from './services/routing-state.service';
import {AppEventEmitter} from './services/app-event-emitter.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserService} from './services/user.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TruncatePipe} from './pipes/truncate.pipe';
import {AngularTokenModule} from 'angular-token';
import {environment} from '../../environments/environment';
import {SectionService} from './services/section.service';
import {NavService} from './services/nav.service';
import {RoleService} from './services/role.service';
import {ApiQueueService} from './services/api-queue.service';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    AngularTokenModule.forRoot({
      apiBase: environment.apiUrl
    })
  ],
  providers: [
    AngularTokenModule,
    RoutingStateService,
    AppEventEmitter,
    NavService,
    ApiService,
    SectionService,
    RoleService,
    UserService,
    ApiQueueService,
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    AngularTokenModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TruncatePipe,
    TranslateModule,
  ],
  declarations: [
    TruncatePipe,
  ]
})
export class CoreModule {
}
