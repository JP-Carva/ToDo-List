import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Task, TaskFiltersPaged, Paginated } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}task`;

  constructor(private http: HttpClient) {}

  list(filters: TaskFiltersPaged = {}): Observable<Paginated<Task>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<Paginated<Task>>(this.base, { params });
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.base}/create`, task);
  }

  update(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, task);
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
