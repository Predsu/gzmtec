import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {

  async getRoute(fromLat: number, fromLon: number, toLat: number, toLon: number, date: string, time: string) {
    const url = `${environment.apiUrl}/api/trip/search?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}&date=${date}&time=${time}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("ERR with fetching route:", error);
      return null;
    }
  }

  async getAllStops() {
    const url = `${environment.apiUrl}/api/stops`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("ERR with fetching stops:", error);
      return [];
    }
  }
}