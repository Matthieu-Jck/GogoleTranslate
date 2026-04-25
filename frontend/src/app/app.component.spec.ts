import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { TranslationApiService } from './core/services/translation-api.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: TranslationApiService,
          useValue: {
            getStyles: () => of([
              { code: 'normal', label: 'Normal', description: 'Test' },
              { code: 'corporate', label: 'Corporate', description: 'Test' }
            ]),
            translate: () => of({
              originalText: 'Hello',
              translatedText: 'Corporate hello',
              styleCode: 'corporate',
              styleLabel: 'Corporate',
              model: 'mock-style-engine'
            })
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
