import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { GOOD } from '../models/good.model';
import { MatSnackBar } from '@angular/material/snack-bar';

import artifactSlots from '../resources/artifactSlotKey.json';
import artifactSets from '../resources/artifactSetKey.json';
import mainStats from '../resources/mainStatKey.json';
import subStats from '../resources/subStatKey.json';
import subStatLookup from '../resources/subStatRolls.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  grassCutterCommand: string = '';
  invalidGOJson: boolean = false;
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

  form: FormGroup = this.formBuilder.group({
    uid: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    goJson: [null, Validators.required],
    grasscutterCommand: [null],
  });

  constructor(
    private formBuilder: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  isJson(item: string) {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === 'object' && item !== null) {
      return true;
    }

    return false;
  }

  goJsonChanged() {
    // reset value first
    this.form.patchValue({
      grasscutterCommand: '',
    });
    this.grassCutterCommand = '';
    // Check if entered string is JSON
    if (this.isJson(this.form.value.goJson)) {
      var goJson: GOOD = JSON.parse(this.form.value.goJson);
      console.log(goJson);
      if (goJson.format == 'GOOD') {
        this.invalidGOJson = false;
        console.log('Valid GOOD format.');
        this.parseGOJson(goJson);
      } else {
        this.invalidGOJson = true;
      }
    } else {
      this.invalidGOJson = true;
    }
  }

  parseGOJson(goJson: GOOD) {
    var uid = this.form.controls['uid'].value.toString();
    goJson.artifacts.forEach((artifact) => {
      var rarity = artifact.rarity;
      var slot = artifactSlots.filter((x) => x.slot === artifact.slotKey)[0].id;
      var setName = artifactSets.filter((x) => x.setName === artifact.setKey)[0]
        .id;
      var artifactSetKey = setName + rarity + slot;
      var level = artifact.level + 1;

      var mainStatKey = mainStats.filter(
        (x) => x.key === artifact.mainStatKey
      )[0].value;

      type RaritiesKey = typeof this.allArtifactRarities[number];
      type SubstatKey = typeof this.allSubstatKeys[number];
      var substatKeys = '';
      artifact.substats.forEach((subStat) => {
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
      });
      var command = `giveart @${uid} ${artifactSetKey} ${mainStatKey} ${substatKeys} ${level.toString()} \n`;
      command = command.replace(/  +/g, ' ');
      this.grassCutterCommand += command;
    });
    this.form.patchValue({
      grasscutterCommand: this.grassCutterCommand,
    });
  }

  copyGrasscutterCommand() {
    if (this.form.value.grasscutterCommand) {
      this.clipboard.copy(this.form.value.grasscutterCommand);
      this.snackBar.open(
        'Copied Grasscutter Command to clipboard!',
        undefined,
        {
          duration: 3000,
        }
      );
    } else {
      this.snackBar.open(
        'Nothing to copy, please fill in your GO JSON Data first!',
        undefined,
        {
          duration: 3000,
        }
      );
    }
  }
}
