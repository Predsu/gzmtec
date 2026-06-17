import { Component, inject, OnInit, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripPlannerService } from '../trip-planner-service';
import { AuthService } from '../auth-service'; 
import { debounceTime } from 'rxjs/operators';
import { Network } from '@capacitor/network';

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
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isMenuCollapsed = true;

  isOnline: boolean = true;

  async setupOnlineListeners() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Błąd pobierania statusu sieci:', e);
    }

    Network.addListener('networkStatusChange', status => {
      console.log('Natywna zmiana stanu sieci w Capacitor:', status);
      this.isOnline = status.connected;
      this.cdr.detectChanges();
    });
  }

  async checkConnection() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    this.cdr.detectChanges();
  }

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

  isArrivalMode: boolean = false; 

  searchForm: FormGroup = this.fb.group({
    fromStopName: ['', Validators.required],
    toStopName: ['', Validators.required],
    date: [this.localDate, Validators.required],
    time: [this.localTime, Validators.required]
  });

  constructor() {
    effect(() => {
      const activeRoute = this.authService.activeFavoriteRoute();
      if (activeRoute) {
        console.log('Zaobserwowano wybór ulubionej trasy:', activeRoute);

        this.selectedFromStop = {
          id: 'fav_from',
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

        this.searchForm.patchValue({
          fromStopName: activeRoute.from_stop_name,
          toStopName: activeRoute.to_stop_name
        }, { emitEvent: false });

        console.log('Obiekty przystanków zostały odtworzone. Uruchamiam wyszukiwanie...');
        this.onSubmit();
      }
    });
  }

  ngOnInit() {
    this.tripService.getAllStops()
      .then((stops: SdipStop[]) => {
        const uniqueMap = new Map<string, SdipStop>();
        
        stops.forEach(stop => {
          if (!uniqueMap.has(stop.name)) {
            uniqueMap.set(stop.name, stop);
          }
        });

        this.allUniqueStops = Array.from(uniqueMap.values());
        
        console.log('Pomyślnie załadowano UNIKALNE przystanki GZMTEC:', this.allUniqueStops.length);
      })
      .catch((err) => {
        console.error('Błąd podczas ładowania przystanków:', err);
        this.allUniqueStops = [];
      });

    this.searchForm.get('fromStopName')?.valueChanges
      .pipe(debounceTime(40))
      .subscribe(value => {
        if (!value || value.trim().length < 2) {
          this.filteredFromStops = [];
          return;
        }

        if (this.selectedFromStop && value === this.selectedFromStop.name) {
          this.filteredFromStops = [];
        } else {
          this.filteredFromStops = this.filterStops(value);
        }
      });

    this.searchForm.get('toStopName')?.valueChanges
      .pipe(debounceTime(250))
      .subscribe(value => {
        if (!value || value.trim().length < 2) {
          this.filteredToStops = [];
          return;
        }

        if (this.selectedToStop && value === this.selectedToStop.name) {
          this.filteredToStops = [];
        } else {
          this.filteredToStops = this.filterStops(value);
        }
      });

    this.route.queryParams.subscribe(params => {
      const fName = params['fromName'];
      const tName = params['toName'];

      if (fName && tName) {
        this.selectedFromStop = {
          id: 'query_from',
          name: fName,
          municipality: '',
          lat: Number(params['fromLat']),
          lon: Number(params['fromLon'])
        };

        this.selectedToStop = {
          id: 'query_to',
          name: tName,
          municipality: '',
          lat: Number(params['toLat']),
          lon: Number(params['toLon'])
        };

        this.searchForm.patchValue({
          fromStopName: fName,
          toStopName: tName
        }, { emitEvent: false });

        this.filteredFromStops = [];
        this.filteredToStops = [];
      }
    });

    this.setupOnlineListeners();
  }

  filterStops(value: string): SdipStop[] {
    const filterValue = value.toLowerCase();
    return this.allUniqueStops.filter(stop => 
      stop.name.toLowerCase().includes(filterValue)
    );
  }

  swapStops(): void {
    const tempStop = this.selectedFromStop;
    const currentFromName = this.searchForm.get('fromStopName')?.value || '';
    const currentToName = this.searchForm.get('toStopName')?.value || '';

    this.selectedFromStop = this.selectedToStop;
    this.selectedToStop = tempStop;

    this.searchForm.patchValue({
      fromStopName: currentToName,
      toStopName: currentFromName
    });

    this.filteredFromStops = [];
    this.filteredToStops = [];
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
      let finalTime = formValues.time;

      if (this.isArrivalMode) {
        const [hours, minutes] = finalTime.split(':').map(Number);
        const dateObj = new Date();
        dateObj.setHours(hours);
        dateObj.setMinutes(minutes - 35);

        const pad = (num: number) => num.toString().padStart(2, '0');
        finalTime = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
      }

      this.router.navigate(['/trip-planner-displayer'], {
        queryParams: {
          fromLat: this.selectedFromStop.lat,
          fromLon: this.selectedFromStop.lon,
          toLat: this.selectedToStop.lat,
          toLon: this.selectedToStop.lon,
          date: formValues.date,
          time: finalTime
        }
      });
    }
  }
}