import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { GOOD } from '../../models/good.model';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ArtiGeneratorService } from '../../services/arti-generator.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss'],
})
export class ConverterComponent implements OnInit {
  invalidGOJson: boolean = false;
  invalidUid: boolean = false;

  form: FormGroup = this.formBuilder.group({
    uid: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    goJson: [null, Validators.required],
    grasscutterCommand: [null],
  });

  constructor(
    private formBuilder: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private artiGenerartor: ArtiGeneratorService
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

  uidChanged() {
    // check if go json is entered, else do nothing
    if (this.form.value.goJson) {
      this.goJsonChanged();
    }
  }

  goJsonChanged() {
    // reset value first
    this.form.patchValue({
      grasscutterCommand: '',
    });
    // Check if UID is entered
    if (this.form.value.uid) {
      console.log('uid ', this.form.value.uid);
      this.invalidUid = false;
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
    } else {
      this.invalidUid = true;
    }
  }

  parseGOJson(goJson: GOOD) {
    var uid = this.form.controls['uid'].value.toString();
    var command = this.artiGenerartor.generateFromJson(uid, goJson);
    this.form.patchValue({
      grasscutterCommand: command,
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
