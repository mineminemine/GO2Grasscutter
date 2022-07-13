import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import subStats from '../resources/subStatKey.json';
import subStatLookup from '../resources/subStatRolls.json';

@Injectable({
  providedIn: 'root',
})
export class SubstatValidatorService {
  allArtifactRarities = [5, 4, 3] as const;
  allSubstatKeys = [
    'hp',
    'hp_',
    'atk',
    'atk_',
    'def',
    'def_',
    'eleMas',
    'enerRech_',
    'critRate_',
    'critDMG_',
  ] as const;

  constructor() {}

  ValidateSubstat(): ValidatorFn | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.parent?.value.key) {
        return null;
      }
      if (
        this.validate(
          control.parent?.parent?.value.rarity,
          control.parent?.value.key,
          control.value
        )
      ) {
        // valid substat
        return null;
      }
      // invalid substat
      return { invalidSubStat: true };
    };
  }

  private validate(rarityF: number, key: string, value: number) {
    type RaritiesKey = typeof this.allArtifactRarities[number];
    type SubstatKey = typeof this.allSubstatKeys[number];
    var subStatStr = '';
    try {
      // Check if empty substat, else ignore
      if (!!key && !!value) {
        let rarity = rarityF as RaritiesKey;
        let substat2 = key as SubstatKey;
        const table: { [key: string]: number[][] } =
          subStatLookup[rarity][substat2];
        const substatIdTable: Array<number> = subStats[rarity][substat2];

        if (table[value.toFixed(1).toString()]) {
          let rolls: Array<number> = table[value.toFixed(1).toString()][0];
          rolls.forEach((roll) => {
            subStatStr += `${substatIdTable[roll].toString()} `;
          });
        } else {
          if (table[value.toString()]) {
            let rolls: Array<number> = table[value.toString()][0];
            rolls.forEach((roll) => {
              subStatStr += `${substatIdTable[roll].toString()} `;
            });
          }
        }
        // Check subStatStr, if empty == false else true
        if (subStatStr) return true;
        else return false;
      }
      return false;
    } catch (e) {
      console.log('Not a valid substat!');
      console.log(e);
      return false;
    }
  }
}
