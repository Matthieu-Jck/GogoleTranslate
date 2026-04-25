import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StyleOption, TranslateResponse } from './core/models/translation.models';
import { TranslationApiService } from './core/services/translation-api.service';

type SiteLanguage = 'fr' | 'en';

interface SiteLanguageOption {
  code: SiteLanguage;
  shortLabel: string;
}

interface UiCopy {
  headline: string;
  siteLanguageLabel: string;
  sourceTitle: string;
  sourceStyleLabel: string;
  sourcePlaceholder: string;
  outputTitle: string;
  outputStyleLabel: string;
  emptyTitle: string;
  emptyBody: string;
  translate: string;
  translating: string;
  resultReady: string;
  errorTranslation: string;
  modelLabel: (model: string) => string;
}

interface LocalizedStyleLabel {
  fr: string;
  en: string;
}

const SITE_LANGUAGE_STORAGE_KEY = 'gogoletranslate-site-language';
const STYLE_ORDER = [
  'normal',
  'corporate',
  'politician',
  'tech-startup',
  'legal',
  'finance',
  'pretentious'
] as const;
const KNOWN_STYLE_CODES = new Set<string>(STYLE_ORDER);

const SITE_LANGUAGES: SiteLanguageOption[] = [
  { code: 'fr', shortLabel: 'FR' },
  { code: 'en', shortLabel: 'EN' }
];

const UI_COPY: Record<SiteLanguage, UiCopy> = {
  fr: {
    headline: 'Traduire un texte',
    siteLanguageLabel: 'Langue du site',
    sourceTitle: 'Source',
    sourceStyleLabel: 'Style source',
    sourcePlaceholder: 'Collez un mail, un message Slack ou une note...',
    outputTitle: 'R\u00e9sultat',
    outputStyleLabel: 'Style r\u00e9sultat',
    emptyTitle: 'Le r\u00e9sultat appara\u00eetra ici.',
    emptyBody: 'Choisissez un style de d\u00e9part et un style d\u2019arriv\u00e9e, puis cliquez sur Traduire.',
    translate: 'Traduire',
    translating: 'Traduction...',
    resultReady: 'Pr\u00eat',
    errorTranslation: 'La traduction a \u00e9chou\u00e9. V\u00e9rifiez le backend ou la cl\u00e9 API.',
    modelLabel: (model) => `Mod\u00e8le ${model}`
  },
  en: {
    headline: 'Translate text',
    siteLanguageLabel: 'Site language',
    sourceTitle: 'Source',
    sourceStyleLabel: 'Source style',
    sourcePlaceholder: 'Paste an email, a Slack message, or a note...',
    outputTitle: 'Result',
    outputStyleLabel: 'Result style',
    emptyTitle: 'The result will appear here.',
    emptyBody: 'Pick a source style and a result style, then click Translate.',
    translate: 'Translate',
    translating: 'Translating...',
    resultReady: 'Ready',
    errorTranslation: 'Translation failed. Check the backend configuration or the API key.',
    modelLabel: (model) => `Model ${model}`
  }
};

const STYLE_LABELS: Record<string, LocalizedStyleLabel> = {
  normal: { fr: 'Normal', en: 'Normal' },
  corporate: { fr: 'Corporate', en: 'Corporate' },
  politician: { fr: 'Politique', en: 'Political' },
  'tech-startup': { fr: 'Startup', en: 'Startup' },
  legal: { fr: 'Juridique', en: 'Legal' },
  finance: { fr: 'Finance', en: 'Finance' },
  pretentious: { fr: 'Artistique', en: 'Artsy' }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly translationApi = inject(TranslationApiService);

  readonly maxCharacters = 5000;
  readonly siteLanguages = SITE_LANGUAGES;
  readonly fallbackStyles: StyleOption[] = [
    { code: 'normal', label: 'Normal', description: 'Neutral, everyday language.' },
    { code: 'corporate', label: 'Corporate', description: 'Boardroom-clean, measured and professional.' },
    { code: 'politician', label: 'Politician', description: 'Public-facing, reassuring, persuasive and slightly evasive.' },
    { code: 'tech-startup', label: 'Tech Startup', description: 'Fast, ambitious, product-obsessed and full of momentum.' },
    { code: 'legal', label: 'Legal', description: 'Formal, precise, cautious and clause-heavy.' },
    { code: 'finance', label: 'Finance', description: 'Analytical, numbers-aware, risk-conscious and market-savvy.' },
    { code: 'pretentious', label: 'Pretentious', description: 'Lofty, overinterpreted and dramatically artsy.' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(this.maxCharacters)]],
    sourceStyle: ['normal', Validators.required],
    targetStyle: ['corporate', Validators.required]
  });

  styles: StyleOption[] = [];
  result: TranslateResponse | null = null;
  isLoading = false;
  hasError = false;
  siteLanguage: SiteLanguage = 'fr';

  ngOnInit(): void {
    this.restoreSiteLanguage();
    this.applySiteLanguage();
    this.form.valueChanges.subscribe(() => {
      this.result = null;
      this.hasError = false;
    });
    this.loadStyles();
  }

  get copy(): UiCopy {
    return UI_COPY[this.siteLanguage];
  }

  get visibleStyles(): StyleOption[] {
    return this.styles.length > 0 ? this.styles : this.fallbackStyles;
  }

  get resultStyleName(): string {
    if (!this.result) {
      return '';
    }

    return this.getStyleName(this.result.styleCode, this.result.styleLabel);
  }

  setSiteLanguage(language: SiteLanguage): void {
    this.siteLanguage = language;
    this.persistSiteLanguage();
    this.applySiteLanguage();
  }

  getStyleName(styleCode: string, fallbackLabel?: string): string {
    return STYLE_LABELS[styleCode]?.[this.siteLanguage] ?? fallbackLabel ?? styleCode;
  }

  submit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.translationApi.translate(this.form.getRawValue())
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          this.result = response;
        },
        error: () => {
          this.hasError = true;
        }
      });
  }

  private applySiteLanguage(): void {
    this.document.documentElement.lang = this.siteLanguage;
  }

  private restoreSiteLanguage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const savedLanguage = localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);

    if (savedLanguage === 'fr' || savedLanguage === 'en') {
      this.siteLanguage = savedLanguage;
    }
  }

  private persistSiteLanguage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, this.siteLanguage);
  }

  private loadStyles(): void {
    this.translationApi.getStyles().subscribe({
      next: (styles) => {
        const sortedStyles = this.sortStyles(styles);
        this.styles = sortedStyles.length > 0 ? sortedStyles : this.fallbackStyles;
        this.ensureValidSelectedStyles();
      },
      error: () => {
        this.styles = this.sortStyles(this.fallbackStyles);
        this.ensureValidSelectedStyles();
      }
    });
  }

  private ensureValidSelectedStyles(): void {
    const sourceStyle = this.form.controls.sourceStyle.value;
    const targetStyle = this.form.controls.targetStyle.value;
    const availableCodes = new Set(this.visibleStyles.map((style) => style.code));

    if (!availableCodes.has(sourceStyle)) {
      this.form.patchValue({ sourceStyle: 'normal' });
    }

    if (!availableCodes.has(targetStyle)) {
      this.form.patchValue({ targetStyle: 'corporate' });
    }
  }

  private sortStyles(styles: StyleOption[]): StyleOption[] {
    const styleByCode = new Map<string, StyleOption>();

    for (const style of styles) {
      if (!styleByCode.has(style.code)) {
        styleByCode.set(style.code, style);
      }
    }

    const knownStyles = STYLE_ORDER
      .map((styleCode) => styleByCode.get(styleCode))
      .filter((style): style is StyleOption => Boolean(style));
    const unknownStyles = styles.filter((style) => !KNOWN_STYLE_CODES.has(style.code));

    return [...knownStyles, ...unknownStyles];
  }
}
