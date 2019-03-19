import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Logger} from '../utils/logger';
import {share} from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient
  ) {
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  private buildUrl(path: string) {
    return `${environment.apiUrl}${path}`;
  }

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    Logger.info(ApiService.name, 'get', `path=${path}, params=${params}`);

    const url = this.buildUrl(path);

    return this.http.get<T>(url, {params})
      .pipe(
        share(),
      );
  }

  searchByTerm<T>(path: string, searchTerm: string): Observable<T> {
    const url = this.buildUrl(path);

    const params = new HttpParams()
      .set('term', searchTerm);

    return this.http.get<T>(url, {params});
  }

  searchById<T>(path: string, id: number): Observable<T> {
    const url = this.buildUrl(path);

    const params = new HttpParams()
      .set('id', id.toString());

    return this.http.get<T>(url, {params});
  }

  put<T>(path: string, body: object = {}): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.put<T>(url, body);
  }

  post<T>(path: string, data: object = {}): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.post<T>(url, data);
  }

  delete<T>(path): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.delete<T>(url);
  }
}
