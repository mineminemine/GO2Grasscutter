import { TestBed } from '@angular/core/testing';

import { ArtiGeneratorService } from './arti-generator.service';

describe('ArtiGeneratorService', () => {
  let service: ArtiGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtiGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
