import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StyleOption, TranslateResponse } from './core/models/translation.models';
import { TranslationApiService } from './core/services/translation-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly translationApi = inject(TranslationApiService);

  readonly form = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(5000)]],
    style: ['corporate', Validators.required]
  });

  styles: StyleOption[] = [];
  result: TranslateResponse | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStyles();
  }

  submit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.translationApi.translate(this.form.getRawValue())
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          this.result = response;
        },
        error: () => {
          this.errorMessage = 'La traduction a echoue. Verifie la configuration du backend ou la cle LLM.';
        }
      });
  }

  private loadStyles(): void {
    this.translationApi.getStyles().subscribe({
      next: (styles) => {
        this.styles = styles;
        if (styles.length > 0) {
          this.form.patchValue({ style: styles[0].code });
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les styles disponibles.';
      }
    });
  }
}
