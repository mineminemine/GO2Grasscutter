import { Substats } from './substats.model';

export interface Artifacts {
  setKey: string;
  rarity: number;
  level: number;
  slotKey: string;
  mainStatKey: string;
  substats: Substats[];
  location: string;
  exclude: boolean;
  lock: boolean;
}
