import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';


import {AngularTokenService, UserData} from 'angular-token';
import {Logger} from '../utils/logger';
import {PageResponse} from '../models/page-response.model';
import {User} from '../models/user.model';
import {HttpParams} from '@angular/common/http';
import {ApiEndpoints} from './api-endpoints';
import {ApiResponse} from '../models/api.response.model';
import {ApiService} from './api.service';
import {Role} from '../models/role.model';
import {CommonType} from '../models/common-type.model';

@Injectable()
export class UserService {
  static STATUS_NOT_VERIFIED = 'not_verified';
  static STATUS_ACTIVE = 'active';
  static STATUS_INACTIVE = 'inactive';

  private currentUserSubject = new BehaviorSubject<UserData>(null);
  public currentUser = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private currentUserRoleSubject = new BehaviorSubject<Role>(null);
  public currentUserRole = this.currentUserRoleSubject.asObservable();

  constructor(
    private tokenService: AngularTokenService,
    private apiService: ApiService
  ) {
    // Logger.info(UserService.name, 'constructor');
    //
    // this.emitUserData();
  }

  emitUserData(isSignedOut: boolean = false) {
    Logger.info(UserService.name, 'emitUserData',
      'currentUserData:', this.tokenService.currentUserData,
      `userSignedIn=${this.tokenService.userSignedIn()}`,
      `isSignedOut=${isSignedOut}`);

    this.setCurrentUserRole(null);

    if (isSignedOut) {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } else {
      this.currentUserSubject.next(this.tokenService.currentUserData);
      this.isAuthenticatedSubject.next(this.tokenService.currentUserData != null);
    }
  }

  setCurrentUserRole(role: Role) {
    Logger.info(UserService.name, 'setCurrentUserRole', 'role:', role);

    this.currentUserRoleSubject.next(role);
  }

  index(page: number, size: number): Observable<PageResponse<User>> {
    Logger.info(UserService.name, 'index',
      `page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<User>>(ApiEndpoints.USERS, httpParams);
  }

  create(user: {}): Observable<ApiResponse> {
    Logger.info(UserService.name, 'create', user);

    return this.apiService.post<ApiResponse>(ApiEndpoints.USERS, user);
  }

  update(user: User): Observable<ApiResponse> {
    Logger.info(UserService.name, 'update', user);

    return this.apiService.put<ApiResponse>(ApiEndpoints.USERS + '/' + user.id, user);
  }

  statuses(): Observable<CommonType[]> {
    return this.apiService.get<CommonType[]>(ApiEndpoints.USERS_STATUSES);
  }

  getAll() {
    return this.apiService.get<User[]>(ApiEndpoints.USERS_ALL);
  }
}
