import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Importujemy ActivatedRoute do czytania URL
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
}

export interface Itinerary {
  legs: Leg[];
}

@Component({
  selector: 'app-trip-planner-displayer',
  standalone: true,
  imports: [CommonModule], // Usunięto TripPlannerFormComponent z importów
  templateUrl: './trip-planner-displayer-component.html'
})
export class TripPlannerDisplayerComponent implements OnInit {
  private tripService = inject(TripPlannerService);
  private route = inject(ActivatedRoute); // Wstrzykujemy ActivatedRoute
  private cdr = inject(ChangeDetectorRef);

  itinerary: Itinerary | null = null;
  isLoading = false;
  hasSearched = false;
  protected readonly Math = Math;

  ngOnInit() {
    // Nasłuchujemy parametrów z paska adresu URL
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
    this.itinerary = null;
    this.cdr.detectChanges();

    const data = await this.tripService.getRoute(
      params.fromLat,
      params.fromLon,
      params.toLat,
      params.toLon,
      params.date,
      params.time
    );

    if (data) {
      this.itinerary = data;
      console.log('Dane odebrane z backendu:', this.itinerary);
    } else {
      console.error('Brak odpowiedzi z serwisu lub wystąpił błąd.');
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