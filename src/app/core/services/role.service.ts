import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../utils/logger';
import {Observable} from 'rxjs';
import {PageResponse} from '../models/page-response.model';
import {ApiResponse} from '../models/api.response.model';
import {Role} from '../models/role.model';

@Injectable()
export class RoleService {

  constructor(
    private apiService: ApiService
  ) {
  }

  index(page: number, size: number): Observable<PageResponse<Role>> {
    Logger.info(RoleService.name, 'index',
      `page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<Role>>(ApiEndpoints.ROLES, httpParams);
  }

  create(role: {}): Observable<ApiResponse> {
    Logger.info(RoleService.name, 'create', role);

    return this.apiService.post<ApiResponse>(ApiEndpoints.ROLES, role);
  }

  update(role): Observable<ApiResponse> {
    Logger.info(RoleService.name, 'update', role);

    return this.apiService.put<ApiResponse>(ApiEndpoints.ROLES + '/' + role.id, role);
  }

  getAll(): Observable<Role[]> {
    return this.apiService.get<Role[]>(ApiEndpoints.ROLES_ALL);
  }

  getMyRole(): Observable<Role> {
    return this.apiService.get<Role>(ApiEndpoints.ROLES_MY_ROLE);
  }
}
