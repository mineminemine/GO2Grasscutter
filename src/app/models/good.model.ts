import { Artifacts } from './artifacts.model';

export interface GOOD {
  format: string;
  dbVersion: number;
  source: string;
  version: number;
  artifacts: Artifacts[];
}
