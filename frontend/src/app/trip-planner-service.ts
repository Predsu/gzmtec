import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {

  async getRoute(fromLat: number, fromLon: number, toLat: number, toLon: number, date: string, time: string) {
    const url = `http://localhost:3000/api/trip/search?fromLat=${fromLat}&fromLon=${fromLon}&toLat=${toLat}&toLon=${toLon}&date=${date}&time=${time}`;
    
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
    const url = `http://localhost:3000/api/stops`;
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