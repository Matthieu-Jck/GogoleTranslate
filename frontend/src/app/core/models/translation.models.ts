export interface TranslateRequest {
  text: string;
  sourceStyle: string;
  targetStyle: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  styleCode: string;
  styleLabel: string;
  model: string;
}

export interface StyleOption {
  code: string;
  label: string;
  description: string;
}
