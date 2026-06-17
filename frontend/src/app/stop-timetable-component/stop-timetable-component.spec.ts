import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopTimetableComponent } from './stop-timetable-component';

describe('StopTimetableComponent', () => {
  let component: StopTimetableComponent;
  let fixture: ComponentFixture<StopTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopTimetableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StopTimetableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
