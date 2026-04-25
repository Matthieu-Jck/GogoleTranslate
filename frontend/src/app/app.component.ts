import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StyleOption, TranslateResponse } from './core/models/translation.models';
import { TranslationApiService } from './core/services/translation-api.service';

type SiteLanguage = 'fr' | 'en';

interface SiteLanguageOption {
  code: SiteLanguage;
  label: string;
  shortLabel: string;
}

interface UiCopy {
  eyebrow: string;
  brandNote: string;
  headline: string;
  subtitle: string;
  siteLanguageLabel: string;
  personaKicker: string;
  personaTitle: string;
  personaPlaceholder: string;
  sourceKicker: string;
  sourceTitle: string;
  sourcePlaceholder: string;
  outputKicker: string;
  outputTitle: string;
  emptyTitle: string;
  emptyBody: string;
  translate: string;
  translating: string;
  sameLanguage: string;
  resultReady: string;
  errorTranslation: string;
  stylesChip: (count: number) => string;
  modelLabel: (model: string) => string;
}

interface StylePersonaConfig {
  portrait: string;
  accent: string;
  label: Record<SiteLanguage, string>;
  archetype: Record<SiteLanguage, string>;
  teaser: Record<SiteLanguage, string>;
}

const SITE_LANGUAGE_STORAGE_KEY = 'gogoletranslate-site-language';
const STYLE_ORDER = [
  'corporate',
  'politician',
  'tech-startup',
  'legal',
  'finance',
  'pretentious'
] as const;
const KNOWN_STYLE_CODES = new Set<string>(STYLE_ORDER);

const SITE_LANGUAGES: SiteLanguageOption[] = [
  { code: 'fr', label: 'Francais', shortLabel: 'FR' },
  { code: 'en', label: 'English', shortLabel: 'EN' }
];

const UI_COPY: Record<SiteLanguage, UiCopy> = {
  fr: {
    eyebrow: 'Translate',
    brandNote: 'Corporate, ministre ou babos: meme texte, autre personnage.',
    headline: 'Translate ton texte',
    subtitle: 'Choisis un personnage, colle ton texte, et laisse-le parler a ta place.',
    siteLanguageLabel: 'Langue du site',
    personaKicker: 'Casting',
    personaTitle: 'Qui parle ?',
    personaPlaceholder: 'Choisis un personnage',
    sourceKicker: 'Source',
    sourceTitle: 'A traduire',
    sourcePlaceholder: 'Mail sec, note Slack, message passif-agressif...',
    outputKicker: 'Sortie',
    outputTitle: 'Resultat',
    emptyTitle: 'Rien pour l\'instant.',
    emptyBody: 'Choisis un personnage puis clique sur Translate.',
    translate: 'Translate',
    translating: 'Translating...',
    sameLanguage: 'Meme langue',
    resultReady: 'Pret',
    errorTranslation: 'La traduction a echoue. Verifie le backend ou la cle API.',
    stylesChip: (count) => `${count} personnages`,
    modelLabel: (model) => `Modele ${model}`
  },
  en: {
    eyebrow: 'Translate',
    brandNote: 'Corporate, minister or bohemian: same text, different character.',
    headline: 'Translate your text',
    subtitle: 'Pick a character, paste your text, and let them do the talking.',
    siteLanguageLabel: 'Site language',
    personaKicker: 'Casting',
    personaTitle: 'Who is talking?',
    personaPlaceholder: 'Pick a character',
    sourceKicker: 'Source',
    sourceTitle: 'To translate',
    sourcePlaceholder: 'Awkward email, tense Slack note, passive-aggressive message...',
    outputKicker: 'Output',
    outputTitle: 'Result',
    emptyTitle: 'Nothing yet.',
    emptyBody: 'Pick a character and click Translate.',
    translate: 'Translate',
    translating: 'Translating...',
    sameLanguage: 'Same language',
    resultReady: 'Ready',
    errorTranslation: 'Translation failed. Check the backend configuration or the API key.',
    stylesChip: (count) => `${count} characters`,
    modelLabel: (model) => `Model ${model}`
  }
};

const GENERIC_PERSONA: StylePersonaConfig = {
  portrait: '/personas/generic.svg',
  accent: '#7c6e55',
  label: {
    fr: 'Personnage mystere',
    en: 'Mystery character'
  },
  archetype: {
    fr: 'Version alternative',
    en: 'Alternate version'
  },
  teaser: {
    fr: 'Meme idee, autre allure.',
    en: 'Same idea, different attitude.'
  }
};

const STYLE_PERSONAS: Record<string, StylePersonaConfig> = {
  corporate: {
    portrait: '/personas/corporate.svg',
    accent: '#8c5b32',
    label: {
      fr: 'Corporate',
      en: 'Corporate'
    },
    archetype: {
      fr: 'PDG sous cafeine',
      en: 'Caffeinated CEO'
    },
    teaser: {
      fr: 'Lisse, net, calibrage boardroom.',
      en: 'Polished, neat, boardroom-approved.'
    }
  },
  politician: {
    portrait: '/personas/politician.svg',
    accent: '#8f4f4c',
    label: {
      fr: 'Politique',
      en: 'Political'
    },
    archetype: {
      fr: 'Ministre en campagne',
      en: 'Campaign minister'
    },
    teaser: {
      fr: 'Rassure beaucoup, promet vaguement.',
      en: 'Very reassuring, gently evasive.'
    }
  },
  'tech-startup': {
    portrait: '/personas/tech-startup.svg',
    accent: '#356a69',
    label: {
      fr: 'Startup',
      en: 'Startup'
    },
    archetype: {
      fr: 'Fondateur en hoodie',
      en: 'Hoodie founder'
    },
    teaser: {
      fr: 'Pitch deck, vitesse, disruption.',
      en: 'Pitch decks, speed, disruption.'
    }
  },
  legal: {
    portrait: '/personas/legal.svg',
    accent: '#4e5872',
    label: {
      fr: 'Juridique',
      en: 'Legal'
    },
    archetype: {
      fr: 'Avocat tres prudent',
      en: 'Cautious lawyer'
    },
    teaser: {
      fr: 'Precis, froid, avec sous-clause implicite.',
      en: 'Precise, cool, clause-heavy.'
    }
  },
  finance: {
    portrait: '/personas/finance.svg',
    accent: '#2f6c48',
    label: {
      fr: 'Finance',
      en: 'Finance'
    },
    archetype: {
      fr: 'Trader sous Excel',
      en: 'Spreadsheet trader'
    },
    teaser: {
      fr: 'Risque, ratios et ton tres sur de lui.',
      en: 'Ratios, risk and a confident tone.'
    }
  },
  pretentious: {
    portrait: '/personas/pretentious.svg',
    accent: '#8b5a7d',
    label: {
      fr: 'Artistique',
      en: 'Artsy'
    },
    archetype: {
      fr: 'Babos inspire',
      en: 'Inspired bohemian'
    },
    teaser: {
      fr: 'Vaporeux, sensible, legerement insupportable.',
      en: 'Airy, sensitive, slightly unbearable.'
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
  private readonly formBuilder = inject(FormBuilder);
  private readonly translationApi = inject(TranslationApiService);

  readonly maxCharacters = 5000;
  readonly siteLanguages = SITE_LANGUAGES;
  readonly fallbackStyles: StyleOption[] = [
    {
      code: 'corporate',
      label: 'Corporate',
      description: 'Boardroom-clean, measured and professional.'
    },
    {
      code: 'politician',
      label: 'Politician',
      description: 'Public-facing, reassuring, persuasive and slightly evasive.'
    },
    {
      code: 'tech-startup',
      label: 'Tech Startup',
      description: 'Fast, ambitious, product-obsessed and full of momentum.'
    },
    {
      code: 'legal',
      label: 'Legal',
      description: 'Formal, precise, cautious and clause-heavy.'
    },
    {
      code: 'finance',
      label: 'Finance',
      description: 'Analytical, numbers-aware, risk-conscious and market-savvy.'
    },
    {
      code: 'pretentious',
      label: 'Pretentious',
      description: 'Lofty, overinterpreted and dramatically artsy.'
    }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(this.maxCharacters)]],
    style: ['corporate', Validators.required]
  });

  styles: StyleOption[] = [];
  result: TranslateResponse | null = null;
  isLoading = false;
  hasError = false;
  siteLanguage: SiteLanguage = 'fr';

  ngOnInit(): void {
    this.restoreSiteLanguage();
    this.loadStyles();
  }

  get copy(): UiCopy {
    return UI_COPY[this.siteLanguage];
  }

  get visibleStyles(): StyleOption[] {
    return this.styles.length > 0 ? this.styles : this.fallbackStyles;
  }

  get selectedStyle(): StyleOption | null {
    return this.visibleStyles.find((style) => style.code === this.form.controls.style.value) ?? null;
  }

  get selectedStyleName(): string {
    return this.selectedStyle ? this.getStyleName(this.selectedStyle) : this.copy.personaPlaceholder;
  }

  get selectedStyleArchetype(): string {
    return this.selectedStyle ? this.getStyleArchetype(this.selectedStyle) : this.copy.personaPlaceholder;
  }

  get resultStyleName(): string {
    if (!this.result) {
      return '';
    }

    return this.getStyleName({
      code: this.result.styleCode,
      label: this.result.styleLabel,
      description: ''
    });
  }

  setSiteLanguage(language: SiteLanguage): void {
    this.siteLanguage = language;
    this.persistSiteLanguage();
  }

  selectStyle(styleCode: string): void {
    this.form.controls.style.setValue(styleCode);
  }

  trackStyle(_index: number, style: StyleOption): string {
    return style.code;
  }

  getStyleName(style: StyleOption): string {
    const persona = this.getStylePersona(style.code);
    return persona.label[this.siteLanguage] || style.label;
  }

  getStyleArchetype(style: StyleOption): string {
    return this.getStylePersona(style.code).archetype[this.siteLanguage];
  }

  getStyleTeaser(style: StyleOption): string {
    const persona = this.getStylePersona(style.code);
    return persona.teaser[this.siteLanguage] || style.description;
  }

  getStylePortrait(style: StyleOption): string {
    return this.getStylePersona(style.code).portrait;
  }

  getStyleAccent(style: StyleOption): string {
    return this.getStylePersona(style.code).accent;
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

  private getStylePersona(styleCode: string): StylePersonaConfig {
    return STYLE_PERSONAS[styleCode] ?? GENERIC_PERSONA;
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
        this.ensureValidSelectedStyle();
      },
      error: () => {
        this.styles = this.sortStyles(this.fallbackStyles);
        this.ensureValidSelectedStyle();
      }
    });
  }

  private ensureValidSelectedStyle(): void {
    const selectedStyleCode = this.form.controls.style.value;

    if (this.visibleStyles.length > 0 && !this.visibleStyles.some((style) => style.code === selectedStyleCode)) {
      this.form.patchValue({ style: this.visibleStyles[0].code });
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
