import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../utils/logger';
import {Observable} from 'rxjs';
import {PageResponse} from '../models/page-response.model';
import {Section} from '../models/section.model';
import {ApiResponse} from '../models/api.response.model';

@Injectable()
export class SectionService {
  constructor(
    private apiService: ApiService
  ) {
  }

  static findChildrenSections(sections: Section[], idsToFind: number[]): Section[] {
    const foundSections = [];

    if (idsToFind && idsToFind.length > 0 && sections && sections.length > 0) {
      for (const section of sections) {
        for (const child of section.children) {
          if (idsToFind.indexOf(child.id) > -1) {
            child.parent = section;
            foundSections.push(child);
          }
        }
      }
    }

    return foundSections;
  }

  index(page: number, size: number): Observable<PageResponse<Section>> {
    Logger.info(SectionService.name, 'index',
      `page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<Section>>(ApiEndpoints.SECTIONS, httpParams);
  }

  create(section: {}): Observable<ApiResponse> {
    Logger.info(SectionService.name, 'create', section);

    return this.apiService.post<ApiResponse>(ApiEndpoints.SECTIONS, section);
  }

  update(section): Observable<ApiResponse> {
    Logger.info(SectionService.name, 'update', section);

    return this.apiService.put<ApiResponse>(ApiEndpoints.SECTIONS + '/' + section.id, section);
  }

  delete(section): Observable<ApiResponse> {
    Logger.info(SectionService.name, 'delete', section);

    return this.apiService.delete<ApiResponse>(ApiEndpoints.SECTIONS + '/' + section.id);
  }

  getAll(): Observable<Section[]> {
    return this.apiService.get<Section[]>(ApiEndpoints.SECTIONS_ALL);
  }

  getAllVisible(): Observable<Section[]> {
    return this.apiService.get<Section[]>(ApiEndpoints.SECTIONS_ALL_VISIBLE);
  }
}
