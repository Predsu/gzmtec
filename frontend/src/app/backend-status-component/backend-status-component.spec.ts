import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendStatusComponent } from './backend-status-component';

describe('BackendStatusComponent', () => {
  let component: BackendStatusComponent;
  let fixture: ComponentFixture<BackendStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BackendStatusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
