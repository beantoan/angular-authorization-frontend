import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {throwError} from 'rxjs';

import {share} from 'rxjs/operators';
import {Logger} from '../utils/logger';
import {AppEventEmitter} from './app-event-emitter.service';

@Injectable()
export class ApiQueueService {
  private isBusy = false;
  private queue = [];

  constructor(
    private http: HttpClient,
    private appEventEmitter: AppEventEmitter,
  ) {
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  private buildUrl(path: string) {
    return `${environment.apiUrl}${path}`;
  }

  private callGet() {

    Logger.info(ApiQueueService.name, 'callGet', `isBusy=${this.isBusy}`);

    if (this.queue.length === 0) {
      this.isBusy = false;
      this.emitLoadingState();
      return;
    }

    if (!this.isBusy) {
      this.isBusy = true;

      this.emitLoadingState();

      const ele = this.queue.shift();

      Logger.info(ApiQueueService.name, 'callGet', ele);

      const params = ele.params;

      this.http.get(ele.url, {params})
        .pipe(
          share(),
        )
        .subscribe(data => {
          if (ele.eventEmitter) {
            ele.eventEmitter.next({
              success: true, data
            });
          }

          this.isBusy = false;

          Logger.info(ApiQueueService.name, 'callGet: success');

          this.emitLoadingState();

          this.callGet();
        }, error => {
          Logger.info(ApiQueueService.name, 'callGet: failed');

          ele.eventEmitter.next({
            success: false, error
          });

          this.isBusy = false;

          this.emitLoadingState();

          this.callGet();
        });
    }
  }

  private emitLoadingState() {
    this.appEventEmitter.loadingState.next(this.queue.length !== 0);
  }

  get<T>(path: string,
         params: HttpParams = new HttpParams(),
         eventEmitter = null) {
    const url = this.buildUrl(path);

    this.queue.push({url, params, eventEmitter});

    Logger.info(ApiQueueService.name, 'get', `path=${path}, params=${params}`, this.queue);

    this.callGet();
  }
}
