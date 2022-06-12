import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { MatSnackBar } from '@angular/material/snack-bar';

import artifacts from '../../resources/mapping/artifactSetKeyMap.json';

import { ArtiGeneratorService } from '../../services/arti-generator.service';
import { ArtifactsMap } from 'src/app/models/mapping/artifactsMap.model';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
})
export class GeneratorComponent implements OnInit {
  artifacts: ArtifactsMap[] = artifacts;
  filteredArtifactSets: Observable<ArtifactsMap[]>;
  invalidGOJson: boolean = false;

  form: FormGroup = this.formBuilder.group({
    uid: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    artifactSet: [null, Validators.required],
    grasscutterCommand: [null],
  });

  constructor(
    private formBuilder: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private artiGenerartor: ArtiGeneratorService
  ) {
    this.filteredArtifactSets = this.form.controls[
      'artifactSet'
    ].valueChanges.pipe(
      startWith(''),
      map((artifact) =>
        artifact ? this._filterArtifactSets(artifact) : this.artifacts.slice()
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

  clearSelectedArtifactSet() {
    this.form.patchValue({
      artifactSet: '',
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
