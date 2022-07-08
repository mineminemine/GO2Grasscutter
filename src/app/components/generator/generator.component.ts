import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { MatSnackBar } from '@angular/material/snack-bar';

import artifacts from '../../resources/mapping/artifactSetKeyMap.json';
import slots from '../../resources/mapping/slotKeyMap.json';

import { ArtiGeneratorService } from '../../services/arti-generator.service';
import { ArtifactsMap } from 'src/app/models/mapping/artifactsMap.model';
import { SlotsMap } from 'src/app/models/mapping/slotsMap.model';
import { RaritiesMap } from 'src/app/models/mapping/raritiesMap.model';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
})
export class GeneratorComponent implements OnInit {
  rarities: RaritiesMap[] = [
    { key: 3, value: '★★★' },
    { key: 4, value: '★★★★' },
    { key: 5, value: '★★★★★' },
  ];
  artifacts: ArtifactsMap[] = artifacts;
  filteredArtifactSets: Observable<ArtifactsMap[]>;
  slots: SlotsMap[] = slots;
  filteredSlots: Observable<SlotsMap[]>;
  invalidGOJson: boolean = false;

  form: FormGroup = this.formBuilder.group({
    uid: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    rarity: [null, Validators.required],
    slot: [null, Validators.required],
    artifactSet: [null, Validators.required],
    mainStatKey: [null, Validators.required],
    subStatKey1: [null, Validators.required],
    subStatKey2: [null, Validators.required],
    subStatKey3: [null, Validators.required],
    subStatKey4: [null],
    grasscutterCommand: [null],
  });

  constructor(
    private formBuilder: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private artiGenerartor: ArtiGeneratorService
  ) {
    // Only include artifacts of rarity 3, 4 or 5
    this.artifacts = artifacts.filter(
      (x) =>
        x.rarities.includes(3) ||
        x.rarities.includes(4) ||
        x.rarities.includes(5)
    );
    // setup filter for autocomplete
    this.filteredArtifactSets = this.form.controls[
      'artifactSet'
    ].valueChanges.pipe(
      startWith(''),
      map((artifact) =>
        artifact ? this._filterArtifactSets(artifact) : this.artifacts.slice()
      )
    );
    this.filteredSlots = this.form.controls['slot'].valueChanges.pipe(
      startWith(''),
      map((slot) => (slot ? this._filterSlots(slot) : this.slots.slice()))
    );
  }

  ngOnInit(): void {}

  private _filterArtifactSets(value: string): ArtifactsMap[] {
    const filterValue = value.toLowerCase();

    return this.artifacts.filter((artifact) =>
      artifact.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterSlots(value: string): SlotsMap[] {
    const filterValue = value.toLowerCase();

    return this.slots.filter((slot) =>
      slot.name.toLowerCase().includes(filterValue)
    );
  }

  clearSelectedArtifactSet() {
    this.form.patchValue({
      artifactSet: null,
    });
  }

  clearSelectedSlot() {
    this.form.patchValue({
      slot: null,
    });
  }

  getSlotName(key: string) {
    var slot = this.slots.find((x) => x.key === key);
    if (slot) return slot.name;
    else return null;
  }

  getSlotImageUrl(key: string) {
    var slot = this.slots.find((x) => x.key === key);
    if (slot) return slot.imageUrl;
    else return null;
  }

  rarityChanged() {
    this.artifacts = artifacts.filter((x) =>
      x.rarities.includes(this.form.controls['rarity'].value)
    );
    this.clearSelectedArtifactSet();
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
