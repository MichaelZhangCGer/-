
export enum AugmentationMode {
  SAFE_PHYSICAL = 'SAFE_PHYSICAL',
  GENERATIVE_AI = 'GENERATIVE_AI'
}

export interface AugmentationEffect {
  id: string;
  name: string;
  description: string;
  promptMod: string;
}

export interface GeneratedSample {
  id: string;
  url: string;
  effect: string;
  mode: AugmentationMode;
}

export interface AppConfig {
  batchSize: number;
}