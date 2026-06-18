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

  private rawStopsDatabase: SdipStop[] = [];

  private refreshIntervalId: any = null;

  toggleNavbar() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  async ngOnInit() {
    await this.setupOnlineListeners();
    if (this.isOnline) {
      await this.loadStopsDatabase();
    }

    this.searchForm.get('stopSearch')?.valueChanges
      .pipe(debounceTime(150))
      .subscribe(val => {
        this.filterStops(val);
      });
  }

  ngOnDestroy() {
    this.clearAutoRefresh();
  }

  async loadStopsDatabase() {
    try {
      const data = await this.tripService.getAllStops();
      this.rawStopsDatabase = data || [];

      const seen = new Set<string>();
      this.allUniqueStops = [];

      for (const stop of this.rawStopsDatabase) {
        const key = `${stop.name.toLowerCase()}||${stop.municipality.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          this.allUniqueStops.push(stop);
        }
      }
      this.filteredStops = [...this.allUniqueStops];
    } catch (err) {
      console.error('Błąd inicjalizacji bazy przystanków:', err);
    }
  }

  filterStops(value: string) {
    if (!value || value.trim().length < 2) {
      this.filteredStops = [];
      return;
    }
    const low = value.toLowerCase();
    this.filteredStops = this.allUniqueStops.filter(s => 
      s.name.toLowerCase().includes(low) || s.municipality.toLowerCase().includes(low)
    );
  }

  selectStop(stop: SdipStop) {
    this.selectedStop = stop;
    this.searchForm.get('stopSearch')?.setValue(`${stop.name} (${stop.municipality})`, { emitEvent: false });
    this.filteredStops = [];
    
    this.fetchLiveDepartures();
    this.startAutoRefresh();
  }

  async fetchLiveDepartures() {
    if (!this.selectedStop) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const matchingStops = this.rawStopsDatabase.filter(s => 
        s.name.toLowerCase() === this.selectedStop!.name.toLowerCase() &&
        s.municipality.toLowerCase() === this.selectedStop!.municipality.toLowerCase()
      );

      const idsToFetch = matchingStops.map(s => s.id);

      if (idsToFetch.length === 0) {
        this.departures = [];
        return;
      }

      const fetchPromises = idsToFetch.map(id => this.tripService.getStopDepartures(id));
      const results = await Promise.all(fetchPromises);

      let aggregatedDepartures: LiveDeparture[] = [];
      for (const list of results) {
        if (Array.isArray(list)) {
          aggregatedDepartures.push(...list);
        }
      }

      aggregatedDepartures.sort((a, b) => a.minutesLeft - b.minutesLeft);

      this.departures = aggregatedDepartures;
    } catch (err) {
      console.error('Błąd pobierania zbiorczej tablicy odjazdów:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  startAutoRefresh() {
    this.clearAutoRefresh();
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
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
    } catch (e) {
      this.isOnline = navigator.onLine;
    }
    this.cdr.detectChanges();
  }
}