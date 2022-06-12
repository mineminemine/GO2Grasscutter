import { Injectable } from '@angular/core';

import artifactSlots from '../resources/artifactSlotKey.json';
import artifactSets from '../resources/artifactSetKey.json';
import mainStats from '../resources/mainStatKey.json';
import subStats from '../resources/subStatKey.json';
import subStatLookup from '../resources/subStatRolls.json';

import { GOOD } from '../models/good.model';

@Injectable({
  providedIn: 'root',
})
export class ArtiGeneratorService {
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

  generateFromJson(uid: string, goJson: GOOD) {
    var command = '';
    goJson.artifacts.forEach((artifact) => {
      try {
        var rarity = artifact.rarity;
        const setKey = artifact.setKey as keyof typeof artifactSets;
        const set = artifactSets[setKey].id;
        const slotKey = artifact.slotKey as keyof typeof artifactSlots;
        const slot = artifactSlots[slotKey];
        const artifactSetKey = set + rarity + slot;
  
        const mainStat = artifact.mainStatKey as keyof typeof mainStats;
        const mainStatKey = mainStats[mainStat];
  
        type RaritiesKey = typeof this.allArtifactRarities[number];
        type SubstatKey = typeof this.allSubstatKeys[number];
        var substatKeys = '';
        artifact.substats.forEach((subStat) => {
          try {
            // Check if empty substat, else ignore
            if(subStat.key != '') {
              let rarity = artifact.rarity as RaritiesKey;
              let substat2 = subStat.key as SubstatKey;
              const table: { [key: string]: number[][] } =
                subStatLookup[rarity][substat2];
              const substatIdTable: Array<number> = subStats[rarity][substat2];
      
              if (table[subStat.value.toFixed(1).toString()]) {
                let rolls: Array<number> =
                  table[subStat.value.toFixed(1).toString()][0];
                rolls.forEach((roll) => {
                  substatKeys += `${substatIdTable[roll].toString()} `;
                });
              } else {
                if (table[subStat.value.toString()]) {
                  let rolls: Array<number> = table[subStat.value.toString()][0];
                  rolls.forEach((roll) => {
                    substatKeys += `${substatIdTable[roll].toString()} `;
                  });
                }
              }
            }
          }
          catch (e) {
            console.log('Unable to generate substat!');
            console.log(subStat);
          }
        });
  
        const level = artifact.level + 1;
        command += `giveart @${uid} ${artifactSetKey} ${mainStatKey} ${substatKeys} ${level.toString()} \n`;
        // Removes any double spaces
        command = command.replace(/  +/g, ' ');
      }
      catch (e) {
        console.log('Unable to generate artifact!');
        console.log(artifact);
      }
    });
    return command;
  }
}
