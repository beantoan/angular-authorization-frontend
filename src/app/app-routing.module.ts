import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AngularTokenService} from 'angular-token';
import {SectionComponent} from './section/section.component';
import {RoleComponent} from './role/role.component';
import {UserComponent} from './user/user.component';

const routes: Routes = [
  {
    path: 'features',
    component: SectionComponent,
    canActivate: [AngularTokenService],
    data: {
      title: 'menu.features',
      icon: 'security'
    }
  },
  {
    path: 'groups',
    component: RoleComponent,
    canActivate: [AngularTokenService],
    data: {
      title: 'menu.groups',
      icon: 'group'
    }
  },
  {
    path: 'accounts',
    component: UserComponent,
    canActivate: [AngularTokenService],
    data: {
      title: 'menu.accounts',
      icon: 'person',
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'menu.login'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
