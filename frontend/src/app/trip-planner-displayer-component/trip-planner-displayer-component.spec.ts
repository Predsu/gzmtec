import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerDisplayerComponent } from './trip-planner-displayer-component';

describe('TripPlannerDisplayerComponent', () => {
  let component: TripPlannerDisplayerComponent;
  let fixture: ComponentFixture<TripPlannerDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripPlannerDisplayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripPlannerDisplayerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
