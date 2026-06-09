import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TripPlannerService } from '../trip-planner-service';

export interface TripSearchParams {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  date: string;
  time: string;
}

export interface Leg {
  mode: 'WALK' | 'BUS' | 'TRAM';
  duration: number;
  startTime: number;
  endTime: number;
  route: { shortName: string } | null;
  from: { name: string; stop?: { gtfsId: string } | null };
  to: { name: string };
  predictedDeviationMinutes?: number;
  predictedSamplesCount?: number;
  expectedStartTime?: number;
  isLive?: boolean;
}

export interface Itinerary {
  legs: Leg[];
}

@Component({
  selector: 'app-trip-planner-displayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-planner-displayer-component.html'
})
export class TripPlannerDisplayerComponent implements OnInit {
  private tripService = inject(TripPlannerService);
  private route = inject(ActivatedRoute); 
  private cdr = inject(ChangeDetectorRef);

  itineraries: Itinerary[] = []; 
  isLoading = false;
  hasSearched = false;
  protected readonly Math = Math;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['fromLat'] && params['fromLon'] && params['toLat'] && params['toLon']) {
        
        const searchParams: TripSearchParams = {
          fromLat: Number(params['fromLat']),
          fromLon: Number(params['fromLon']),
          toLat: Number(params['toLat']),
          toLon: Number(params['toLon']),
          date: params['date'],
          time: params['time']
        };

        console.log('Wykryto parametry w URL, uruchamiam wyszukiwanie:', searchParams);
        this.onSearchRoute(searchParams);
      }
    });
  }

  async onSearchRoute(params: TripSearchParams) {
    this.isLoading = true;
    this.hasSearched = true;
    this.itineraries = [];
    this.cdr.detectChanges();

    const data = await this.tripService.getRoute(
      params.fromLat,
      params.fromLon,
      params.toLat,
      params.toLon,
      params.date,
      params.time
    );

    if (data && Array.isArray(data)) {
      this.itineraries = data;
      console.log('Dane odebrane z backendu:', this.itineraries);
    } else {
      this.itineraries = [];
      console.error('Brak odpowiedzi z serwisu lub niepoprawny format danych.');
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  getModeBg(mode: string): string {
    switch (mode) {
      case 'BUS': return 'bg-warning text-dark';
      case 'TRAM': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}