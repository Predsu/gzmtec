import { Injectable, signal } from '@angular/core';

export interface FavoriteRoute {
  id: number;
  route_name: string;
  from_stop_name: string;
  from_lat: number;
  from_lon: number;
  to_stop_name: string;
  to_lat: number;
  to_lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<string | null>(localStorage.getItem('username'));
  private token = localStorage.getItem('token');

  activeFavoriteRoute = signal<FavoriteRoute | null>(null);

  isLoggedIn() {
    return this.currentUser() !== null;
  }

  getToken() {
    return this.token;
  }

  async login(credentials: any) {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Błędne dane logowania');
    const data = await res.json();
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    this.token = data.token;
    this.currentUser.set(data.username);
  }

  async register(userData: any) {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Błąd rejestracji');
    return await res.json();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.token = null;
    this.currentUser.set(null);
    this.activeFavoriteRoute.set(null);
  }

  async getFavorites(): Promise<FavoriteRoute[]> {
    if (!this.token) return [];
    const res = await fetch('http://localhost:3000/user/favorites', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return res.ok ? await res.json() : [];
  }

  async addFavorite(routeData: any) {
    const res = await fetch('http://localhost:3000/user/favorites', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}` 
      },
      body: JSON.stringify(routeData)
    });
    return res.ok;
  }
}