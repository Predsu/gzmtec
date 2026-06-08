import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripPlannerService } from '../trip-planner-service';
import { ChangeDetectorRef } from '@angular/core';

export interface Leg {
  mode: 'WALK' | 'BUS' | 'TRAM';
  duration: number;
  startTime: number;
  endTime: number;
  route: { shortName: string } | null;
  from: { name: string; stop?: { gtfsId: string } | null };
  to: { name: string };
  predictedDeviationSeconds?: number;
  predictedSamplesCount?: number;
  expectedStartTime?: number;
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
  private cdr = inject(ChangeDetectorRef);

  itinerary: Itinerary | null = null;
  isLoading = true;
  protected readonly Math = Math;

  async ngOnInit() {
    this.isLoading = true;
    
    const fromLat = 50.34377;
    const fromLon = 18.91225;
    const toLat = 50.27091;
    const toLon = 18.99703;
    const date = '2026-06-10'; 
    const time = '12:47';

    const data = await this.tripService.getRoute(fromLat, fromLon, toLat, toLon, date, time);
    
    if (data) {
      this.itinerary = data;
      this.isLoading = false;
      console.log('Loaded data:', this.itinerary);
      
      this.cdr.detectChanges(); 
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getModeBg(mode: string): string {
    switch (mode) {
      case 'BUS': return 'bg-warning text-dark';
      case 'TRAM': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}