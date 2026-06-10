import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripPlannerService } from '../trip-planner-service';
import { debounceTime, map } from 'rxjs/operators';

export interface SdipStop {
  id: string;
  name: string;
  municipality: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-trip-planner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-planner-form-component.html'
})
export class TripPlannerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tripService = inject(TripPlannerService);

  private now = new Date();
  private localDate = this.now.getFullYear() + '-' + 
                      String(this.now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(this.now.getDate()).padStart(2, '0');
  private localTime = String(this.now.getHours()).padStart(2, '0') + ':' + 
                      String(this.now.getMinutes()).padStart(2, '0');

  allUniqueStops: SdipStop[] = [];
  filteredFromStops: SdipStop[] = [];
  filteredToStops: SdipStop[] = [];

  selectedFromStop: SdipStop | null = null;
  selectedToStop: SdipStop | null = null;

  searchForm: FormGroup = this.fb.group({
    fromStopName: ['', Validators.required],
    toStopName: ['', Validators.required],
    date: [this.localDate, Validators.required],
    time: [this.localTime, Validators.required]
  });

  async ngOnInit() {
    const rawStops = await this.tripService.getAllStops();
    this.allUniqueStops = this.processAndGroupStops(rawStops);

    this.searchForm.get('fromStopName')?.valueChanges.pipe(
      debounceTime(150),
      map(value => this.filterStops(value))
    ).subscribe(stops => {
      this.filteredFromStops = stops;
    });

    this.searchForm.get('toStopName')?.valueChanges.pipe(
      debounceTime(150),
      map(value => this.filterStops(value))
    ).subscribe(stops => {
      this.filteredToStops = stops;
    });
  }

  private processAndGroupStops(stops: any[]): SdipStop[] {
    if (!Array.isArray(stops)) return [];
    
    const uniqueMap = new Map<string, SdipStop>();
    
    stops.forEach(stop => {
      const key = `${stop.name.toLowerCase().trim()}_${stop.municipality.toLowerCase().trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: stop.id,
          name: stop.name,
          municipality: stop.municipality,
          lat: Number(stop.lat),
          lon: Number(stop.lon)
        });
      }
    });
    
    return Array.from(uniqueMap.values());
  }

  private filterStops(value: string): SdipStop[] {
    const filterValue = (value || '').toLowerCase().trim();
    if (filterValue.length < 2) return [];
    
    return this.allUniqueStops.filter(stop => 
      stop.name.toLowerCase().includes(filterValue) || 
      stop.municipality.toLowerCase().includes(filterValue)
    ).slice(0, 8);
  }

  selectFromStop(stop: SdipStop) {
    this.selectedFromStop = stop;
    this.searchForm.get('fromStopName')?.setValue(stop.name, { emitEvent: false });
    this.filteredFromStops = [];
  }

  selectToStop(stop: SdipStop) {
    this.selectedToStop = stop;
    this.searchForm.get('toStopName')?.setValue(stop.name, { emitEvent: false });
    this.filteredToStops = [];
  }

  onSubmit() {
    console.log('Wysyłanie formularza na podstawie nazw przystanków...');

    if (this.searchForm.valid && this.selectedFromStop && this.selectedToStop) {
      const formValues = this.searchForm.value;
      
      this.router.navigate(['/trip-planner-displayer'], {
        queryParams: {
          fromLat: this.selectedFromStop.lat,
          fromLon: this.selectedFromStop.lon,
          toLat: this.selectedToStop.lat,
          toLon: this.selectedToStop.lon,
          date: formValues.date,
          time: formValues.time
        }
      });
    } else {
      this.searchForm.markAllAsTouched();
    }
  }
}