import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StyleOption, TranslateRequest, TranslateResponse } from '../models/translation.models';

@Injectable({ providedIn: 'root' })
export class TranslationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getStyles(): Observable<StyleOption[]> {
    return this.http.get<StyleOption[]>(`${this.apiBaseUrl}/styles`);
  }

  translate(payload: TranslateRequest): Observable<TranslateResponse> {
    return this.http.post<TranslateResponse>(`${this.apiBaseUrl}/translate`, payload);
  }
}
