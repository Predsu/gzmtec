import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TripPlannerService } from '../trip-planner-service';
import { SdipStop } from '../trip-planner-form-component/trip-planner-form-component';
import { debounceTime } from 'rxjs/operators';
import { Network } from '@capacitor/network';

export interface LiveDeparture {
  lineLabel: string;
  direction: string;
  minutesLeft: number;
  actualTime: string;
  isLive: boolean;
}

@Component({
  selector: 'app-stop-timetable',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stop-timetable-component.html'
})
export class StopTimetableComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private tripService = inject(TripPlannerService);
  private cdr = inject(ChangeDetectorRef);

  searchForm: FormGroup = this.fb.group({
    stopSearch: ['']
  });

  isMenuCollapsed = true;
  isOnline = true;
  isLoading = false;

  allUniqueStops: SdipStop[] = [];
  filteredStops: SdipStop[] = [];
  selectedStop: SdipStop | null = null;
  departures: LiveDeparture[] = [];

  private refreshIntervalId: any = null;

  toggleNavbar() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  async ngOnInit() {
    // 1. Sprawdź i nasłuchuj sieć przez Capacitora bez blokowania UI
    await this.setupOnlineListeners();

    if (this.isOnline) {
      this.loadStopsDatabase();
    }

    // 2. Błyskawiczny autocomplete wyszukiwania przystanku (50ms debounetime)
    this.searchForm.get('stopSearch')?.valueChanges
      .pipe(debounceTime(50))
      .subscribe(value => {
        if (!value || value.trim().length < 1) {
          this.filteredStops = [];
          return;
        }

        if (this.selectedStop && value === this.selectedStop.name) {
          this.filteredStops = [];
        } else {
          const filterValue = value.toLowerCase();
          this.filteredStops = this.allUniqueStops.filter(stop =>
            stop.name.toLowerCase().includes(filterValue) ||
            stop.municipality.toLowerCase().includes(filterValue)
          ).slice(0, 8);
        }
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.clearAutoRefresh();
  }

  loadStopsDatabase() {
    this.tripService.getAllStops().then((stops: SdipStop[]) => {
      const uniqueMap = new Map<string, SdipStop>();
      stops.forEach(stop => {
        if (!uniqueMap.has(stop.name)) {
          uniqueMap.set(stop.name, stop);
        }
      });
      this.allUniqueStops = Array.from(uniqueMap.values());
    });
  }

  async selectStop(stop: SdipStop) {
    this.selectedStop = stop;
    this.searchForm.get('stopSearch')?.setValue(stop.name, { emitEvent: false });
    this.filteredStops = [];
    
    await this.fetchLiveDepartures();
    this.startAutoRefresh();
  }

  async fetchLiveDepartures() {
    if (!this.selectedStop || !this.isOnline) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const data = await this.tripService.getStopDepartures(this.selectedStop.id);
      this.departures = data || [];
    } catch (err) {
      console.error('Błąd pobierania tablicy odjazdów:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  startAutoRefresh() {
    this.clearAutoRefresh();
    // Samoczynne odświeżanie tablicy co 20 sekund
    this.refreshIntervalId = setInterval(() => {
      this.fetchLiveDepartures();
    }, 20000);
  }

  clearAutoRefresh() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  async setupOnlineListeners() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      this.cdr.detectChanges();
    } catch (e) {
      this.isOnline = navigator.onLine;
    }

    Network.addListener('networkStatusChange', status => {
      this.isOnline = status.connected;
      if (!this.isOnline) {
        this.clearAutoRefresh();
      } else if (this.allUniqueStops.length === 0) {
        this.loadStopsDatabase();
      }
      this.cdr.detectChanges();
    });
  }

  async checkConnection() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    if (this.isOnline && this.allUniqueStops.length === 0) {
      this.loadStopsDatabase();
    }
    this.cdr.detectChanges();
  }
}