import { TestBed } from '@angular/core/testing';

import { SubstatValidatorService } from './substat-validator.service';

describe('SubstatValidatorService', () => {
  let service: SubstatValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubstatValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
