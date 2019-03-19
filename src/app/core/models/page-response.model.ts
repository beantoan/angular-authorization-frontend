export interface PageResponse<T> {
  entries: T[];
  total_pages: number;
  total_elements: number;
  next_page: number;
  prev_page: number;
}
