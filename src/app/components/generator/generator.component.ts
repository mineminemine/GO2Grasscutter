import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { MatSnackBar } from '@angular/material/snack-bar';

import slots from '../../resources/mapping/slotKeyMap.json';
import artifacts from '../../resources/mapping/artifactSetKeyMap.json';
import mainStats from '../../resources/mapping/mainStatKeyMap.json';
import subStats from '../../resources/mapping/subStatKeyMap.json';

import { ArtiGeneratorService } from '../../services/arti-generator.service';
import { SlotsMap } from 'src/app/models/mapping/slotsMap.model';
import { ArtifactsMap } from 'src/app/models/mapping/artifactsMap.model';
import { RaritiesMap } from 'src/app/models/mapping/raritiesMap.model';
import { map, Observable, startWith } from 'rxjs';
import { MainStatsMap } from 'src/app/models/mapping/mainStatsMap.model';
import { SubStatsMap } from 'src/app/models/mapping/subStatsMap.model';
import { SubstatValidatorService } from 'src/app/services/substat-validator.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
})
export class GeneratorComponent implements OnInit {
  rarities: RaritiesMap[] = [
    { key: 3, value: '★★★', tooltip: '3 ★ Rarity', color: '#FFCC32' },
    { key: 4, value: '★★★★', tooltip: '4 ★ Rarity', color: '#FFCC32' },
    { key: 5, value: '★★★★★', tooltip: '5 ★ Rarity', color: '#FFCC32' },
  ];
  slots: SlotsMap[] = slots;
  artifacts: ArtifactsMap[] = artifacts;
  filteredArtifactSets: Observable<ArtifactsMap[]>;
  mainStats: MainStatsMap[] = mainStats;
  filteredMainStats: Observable<MainStatsMap[]>;
  subStats1: SubStatsMap[] = subStats;
  subStats2: SubStatsMap[] = subStats;
  subStats3: SubStatsMap[] = subStats;
  subStats4: SubStatsMap[] = subStats;
  invalidSubStat1: boolean = false;
  invalidSubStat2: boolean = false;
  invalidSubStat3: boolean = false;
  invalidSubStat4: boolean = false;
  invalidGOJson: boolean = false;

  form: FormGroup = this.formBuilder.group({
    uid: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    rarity: [5, Validators.required],
    slot: ['flower', Validators.required],
    level: [0, [Validators.required, Validators.pattern('^[0-9]*$')]],
    artifactSet: [null, Validators.required],
    mainStatKey: [null, Validators.required],
    subStat1: this.formBuilder.group({
      key: [null, Validators.required],
      value: [
        null,
        [Validators.required, this.substatValidator.ValidateSubstat()],
      ],
    }),
    subStat2: this.formBuilder.group({
      key: [null, Validators.required],
      value: [
        null,
        [Validators.required, this.substatValidator.ValidateSubstat()],
      ],
    }),
    subStat3: this.formBuilder.group({
      key: [null, Validators.required],
      value: [
        null,
        [Validators.required, this.substatValidator.ValidateSubstat()],
      ],
    }),
    subStat4: this.formBuilder.group({
      key: [null],
      value: [null, [this.substatValidator.ValidateSubstat()]],
    }),
    grasscutterCommand: [null],
  });

  constructor(
    private formBuilder: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private artiGenerator: ArtiGeneratorService,
    private substatValidator: SubstatValidatorService
  ) {
    // Only include artifacts of rarity 5 at startup
    this.artifacts = artifacts.filter((x) => x.rarities.includes(5));
    // Only include artifacts of rarity 5 at startup
    this.mainStats = mainStats.filter((x) => x.validSlots.includes('flower'));
    // setup filter for autocomplete
    this.filteredArtifactSets = this.form.controls[
      'artifactSet'
    ].valueChanges.pipe(
      startWith(''),
      map((artifact) =>
        artifact ? this._filterArtifactSets(artifact) : this.artifacts.slice()
      )
    );
    this.filteredMainStats = this.form.controls[
      'mainStatKey'
    ].valueChanges.pipe(
      startWith(''),
      map((mainStat) =>
        mainStat ? this._filterMainStats(mainStat) : this.mainStats.slice()
      )
    );
  }

  ngOnInit(): void {}

  private _filterArtifactSets(value: string): ArtifactsMap[] {
    const filterValue = value.toLowerCase();

    return this.artifacts.filter((artifact) =>
      artifact.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterMainStats(value: string): MainStatsMap[] {
    const filterValue = value.toLowerCase();

    return this.mainStats.filter((mainStat) =>
      mainStat.name.toLowerCase().includes(filterValue)
    );
  }

  clearSelectedArtifactSet() {
    this.form.patchValue({
      artifactSet: null,
      grasscutterCommand: null,
    });
  }

  clearSelectedMainStat() {
    this.form.patchValue({
      mainStatKey: null,
      grasscutterCommand: null,
    });
  }

  rarityChanged() {
    this.artifacts = artifacts.filter((x) =>
      x.rarities.includes(this.form.controls['rarity'].value)
    );
    this.clearSelectedArtifactSet();
  }

  slotChanged() {
    this.mainStats = mainStats.filter((x) =>
      x.validSlots.includes(this.form.controls['slot'].value)
    );
    this.clearSelectedMainStat();
  }

  mainStatSelected() {
    this.form.patchValue({
      subStat1: { key: null },
      subStat2: { key: null },
      subStat3: { key: null },
      subStat4: { key: null },
    });
    this.subStatSelected();
  }

  subStatSelected() {
    const theMainStat = this.mainStats.find(
      (x) => x.name === this.form.controls['mainStatKey'].value
    );
    this.subStats4 = subStats.filter(
      (x) =>
        x.key !== theMainStat?.key &&
        x.key !== this.form.controls['subStat1'].get('key')?.value &&
        x.key !== this.form.controls['subStat2'].get('key')?.value &&
        x.key !== this.form.controls['subStat3'].get('key')?.value
    );
    this.subStats3 = subStats.filter(
      (x) =>
        x.key !== theMainStat?.key &&
        x.key !== this.form.controls['subStat1'].get('key')?.value &&
        x.key !== this.form.controls['subStat2'].get('key')?.value &&
        x.key !== this.form.controls['subStat4'].get('key')?.value
    );
    this.subStats2 = subStats.filter(
      (x) =>
        x.key !== theMainStat?.key &&
        x.key !== this.form.controls['subStat1'].get('key')?.value &&
        x.key !== this.form.controls['subStat3'].get('key')?.value &&
        x.key !== this.form.controls['subStat4'].get('key')?.value
    );
    this.subStats1 = subStats.filter(
      (x) =>
        x.key !== theMainStat?.key &&
        x.key !== this.form.controls['subStat2'].get('key')?.value &&
        x.key !== this.form.controls['subStat3'].get('key')?.value &&
        x.key !== this.form.controls['subStat4'].get('key')?.value
    );
  }

  generateCommand() {
    if (this.form.valid) {
      //console.log('valid genearte command');
      var command = this.artiGenerator.generateFromForm(this.form);
      this.form.patchValue({
        grasscutterCommand: command,
      });
    } else {
      //console.log('not valid genearte command');
      this.form.patchValue({
        grasscutterCommand: null,
      });
    }
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
        'Nothing to copy, please fill in the fields first!',
        undefined,
        {
          duration: 3000,
        }
      );
    }
  }
}
