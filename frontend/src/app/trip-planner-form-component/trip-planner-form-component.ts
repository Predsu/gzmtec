import { Component, inject, OnInit, effect } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripPlannerService } from '../trip-planner-service';
import { AuthService } from '../auth-service'; 
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
  protected authService = inject(AuthService); 

  isMenuCollapsed = true;

  toggleNavbar() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

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

  constructor() {
    // REAKTYWNY EFEKT: Nasłuchiwanie zmian w sygnale activeFavoriteRoute
    effect(() => {
      const activeRoute = this.authService.activeFavoriteRoute();
      if (activeRoute) {
        console.log('Zaobserwowano wybór ulubionej trasy:', activeRoute);

        // 1. Rekonstruujemy obiekty SdipStop z danych z bazy (snake_case z MySQL)
        this.selectedFromStop = {
          id: 'fav_from', // tymczasowe ID, ważne aby obiekt nie był null
          name: activeRoute.from_stop_name,
          municipality: '', 
          lat: Number(activeRoute.from_lat),
          lon: Number(activeRoute.from_lon)
        };

        this.selectedToStop = {
          id: 'fav_to',
          name: activeRoute.to_stop_name,
          municipality: '',
          lat: Number(activeRoute.to_lat),
          lon: Number(activeRoute.to_lon)
        };

        // 2. Aktualizujemy wartości tekstowe w formularzu Reactive Forms
        this.searchForm.patchValue({
          fromStopName: activeRoute.from_stop_name,
          toStopName: activeRoute.to_stop_name
        }, { emitEvent: false });

        console.log('Obiekty przystanków zostały odtworzone. Uruchamiam wyszukiwanie...');

        // 3. Wywołujemy natychmiastowe wyszukanie i przekierowanie
        this.onSubmit();
      }
    });
  }

  async ngOnInit() {
    const rawStops = await this.tripService.getAllStops();
    this.allUniqueStops = this.processAndGroupStops(rawStops);

    this.searchForm.get('fromStopName')?.valueChanges.pipe(
      debounceTime(150),
      map(value => this.filterStops(value))
    ).subscribe(stops => this.filteredFromStops = stops);

    this.searchForm.get('toStopName')?.valueChanges.pipe(
      debounceTime(150),
      map(value => this.filterStops(value))
    ).subscribe(stops => this.filteredToStops = stops);
  }

  private processAndGroupStops(stops: any[]): SdipStop[] {
    if (!Array.isArray(stops)) return [];
    const uniqueMap = new Map<string, SdipStop>();
    stops.forEach(stop => {
      const key = `${stop.name.toLowerCase().trim()}_${stop.municipality.toLowerCase().trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { id: stop.id, name: stop.name, municipality: stop.municipality, lat: Number(stop.lat), lon: Number(stop.lon) });
      }
    });
    return Array.from(uniqueMap.values());
  }

  private filterStops(value: string): SdipStop[] {
    const filterValue = (value || '').toLowerCase().trim();
    if (filterValue.length < 2) return [];
    return this.allUniqueStops.filter(stop => 
      stop.name.toLowerCase().includes(filterValue) || stop.municipality.toLowerCase().includes(filterValue)
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

  async saveAsFavorite() {
    if (!this.selectedFromStop || !this.selectedToStop) return;
    const name = prompt('Wprowadź przyjazną nazwę dla trasy (np. Praca -> Dom):');
    if (!name) return;

    await this.authService.addFavorite({
      routeName: name,
      fromStopName: this.selectedFromStop.name,
      fromLat: this.selectedFromStop.lat,
      fromLon: this.selectedFromStop.lon,
      toStopName: this.selectedToStop.name,
      toLat: this.selectedToStop.lat,
      toLon: this.selectedToStop.lon
    });
    alert('Trasa pomyślnie dodana! Pojawi się w Twoim panelu pasażera.');
  }

  onSubmit() {
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