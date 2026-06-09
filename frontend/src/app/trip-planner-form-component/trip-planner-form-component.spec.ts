import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerFormComponent } from './trip-planner-form-component';

describe('TripPlannerFormComponent', () => {
  let component: TripPlannerFormComponent;
  let fixture: ComponentFixture<TripPlannerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripPlannerFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripPlannerFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
