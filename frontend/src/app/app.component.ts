import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StyleOption, TranslateResponse } from './core/models/translation.models';
import { TranslationApiService } from './core/services/translation-api.service';

type SiteLanguage = 'fr' | 'en';
type StyleControlName = 'sourceStyle' | 'targetStyle';

interface SiteLanguageOption {
  code: SiteLanguage;
  shortLabel: string;
}

interface UiCopy {
  siteLanguageLabel: string;
  sourceTitle: string;
  sourcePlaceholder: string;
  outputTitle: string;
  chooseLanguage: string;
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

interface StyleMeta {
  icon: string;
  name: LocalizedStyleLabel;
  description: LocalizedStyleLabel;
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
    siteLanguageLabel: 'Langue du site',
    sourceTitle: 'Texte source',
    sourcePlaceholder: 'Quel texte souhaitez-vous traduire ?',
    outputTitle: 'Traduction',
    chooseLanguage: 'Choisissez une langue',
    emptyTitle: 'La traduction appara\u00eetra ici.',
    emptyBody: 'Choisissez une langue de d\u00e9part et une langue d\u2019arriv\u00e9e, puis cliquez sur Traduire.',
    translate: 'Traduire',
    translating: 'Traduction...',
    resultReady: 'Pr\u00eat',
    errorTranslation: 'La traduction a \u00e9chou\u00e9. V\u00e9rifiez le backend ou la cl\u00e9 API.',
    modelLabel: (model) => `Mod\u00e8le ${model}`
  },
  en: {
    siteLanguageLabel: 'Site language',
    sourceTitle: 'Source text',
    sourcePlaceholder: 'What text do you want to translate?',
    outputTitle: 'Translation',
    chooseLanguage: 'Choose a language',
    emptyTitle: 'The translation will appear here.',
    emptyBody: 'Choose a source language and a target language, then click Translate.',
    translate: 'Translate',
    translating: 'Translating...',
    resultReady: 'Ready',
    errorTranslation: 'Translation failed. Check the backend configuration or the API key.',
    modelLabel: (model) => `Model ${model}`
  }
};

const DEFAULT_STYLE_ICON = '🌐';

const STYLE_META: Record<string, StyleMeta> = {
  normal: {
    icon: '💬',
    name: { fr: 'Langue courante', en: 'Everyday language' },
    description: {
      fr: 'Simple, claire et naturelle.',
      en: 'Simple, clear and natural.'
    }
  },
  corporate: {
    icon: '🏢',
    name: { fr: 'Langue corporate', en: 'Corporate language' },
    description: {
      fr: 'Pos\u00e9e, professionnelle et tr\u00e8s bureau.',
      en: 'Measured, polished and office-ready.'
    }
  },
  politician: {
    icon: '🏛️',
    name: { fr: 'Langue politique', en: 'Political language' },
    description: {
      fr: 'Rassurante, publique et un peu \u00e9vasive.',
      en: 'Public-facing, reassuring and slightly evasive.'
    }
  },
  'tech-startup': {
    icon: '🚀',
    name: { fr: 'Langue startup', en: 'Startup language' },
    description: {
      fr: 'Rapide, ambitieuse et obs\u00e9d\u00e9e produit.',
      en: 'Fast, ambitious and product-obsessed.'
    }
  },
  legal: {
    icon: '⚖️',
    name: { fr: 'Langue juridique', en: 'Legal language' },
    description: {
      fr: 'Pr\u00e9cise, formelle et pleine de nuances.',
      en: 'Formal, precise and nuance-heavy.'
    }
  },
  finance: {
    icon: '📈',
    name: { fr: 'Langue finance', en: 'Finance language' },
    description: {
      fr: 'Chiffr\u00e9e, prudente et orient\u00e9e march\u00e9.',
      en: 'Analytical, careful and market-minded.'
    }
  },
  pretentious: {
    icon: '🎭',
    name: { fr: 'Langue artistique', en: 'Artsy language' },
    description: {
      fr: 'Th\u00e9\u00e2trale, sophistiqu\u00e9e et volontairement extra.',
      en: 'Lofty, dramatic and intentionally extra.'
    }
  }
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
  openPicker: StyleControlName | null = null;

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

  get selectedSourceStyle(): StyleOption {
    return this.getSelectedStyle('sourceStyle');
  }

  get selectedTargetStyle(): StyleOption {
    return this.getSelectedStyle('targetStyle');
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Element && target.closest('.language-picker')) {
      return;
    }

    this.openPicker = null;
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.openPicker = null;
  }

  setSiteLanguage(language: SiteLanguage): void {
    this.siteLanguage = language;
    this.persistSiteLanguage();
    this.applySiteLanguage();
  }

  getStyleName(styleCode: string, fallbackLabel?: string): string {
    return STYLE_META[styleCode]?.name[this.siteLanguage] ?? fallbackLabel ?? styleCode;
  }

  getStyleDescription(style: StyleOption): string {
    return STYLE_META[style.code]?.description[this.siteLanguage] ?? style.description;
  }

  getStyleIcon(styleCode: string): string {
    return STYLE_META[styleCode]?.icon ?? DEFAULT_STYLE_ICON;
  }

  isPickerOpen(controlName: StyleControlName): boolean {
    return this.openPicker === controlName;
  }

  togglePicker(controlName: StyleControlName): void {
    this.openPicker = this.openPicker === controlName ? null : controlName;
  }

  selectStyle(controlName: StyleControlName, styleCode: string): void {
    this.form.controls[controlName].setValue(styleCode);
    this.openPicker = null;
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

  private getSelectedStyle(controlName: StyleControlName): StyleOption {
    const selectedCode = this.form.controls[controlName].value;

    return this.visibleStyles.find((style) => style.code === selectedCode) ?? {
      code: selectedCode,
      label: selectedCode,
      description: ''
    };
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
