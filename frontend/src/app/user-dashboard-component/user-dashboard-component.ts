import { Component, inject, OnInit, effect, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, FavoriteRoute } from '../auth-service';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-dashboard-component.html'
})
export class UserDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  private router = inject(Router);
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
      console.log('Natywna zmiana stanu sieci w panelu:', status);
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

  isLoginMode = true;
  errorMessage = '';
  
  favorites = signal<FavoriteRoute[]>([]);

  authForm: FormGroup = this.fb.group({
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async ngOnInit() {
    await this.setupOnlineListeners();

    if (this.isOnline && this.authService.isLoggedIn()) {
      try {
        await this.loadFavorites();
      } catch (err) {
        console.error('Nie udało się załadować ulubionych tras:', err);
      }
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.authForm.reset();
  }

  async onSubmitAuth() {
    if (this.authForm.invalid) return;
    this.errorMessage = '';

    try {
      if (this.isLoginMode) {
        await this.authService.login({
          email: this.authForm.value.email,
          password: this.authForm.value.password
        });
        
        setTimeout(async () => {
          await this.loadFavorites();
        }, 50);

      } else {
        await this.authService.register(this.authForm.value);
        this.isLoginMode = true; 
        this.authForm.reset();
        alert('Konto utworzone! Możesz się teraz zalogować.');
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Wystąpił błąd autoryzacji.';
    }
  }

  async loadFavorites() {
    const data = await this.authService.getFavorites();
    this.favorites.set(data || []);
    console.log('Załadowane ulubione trasy:', this.favorites());
  }

  applyRoute(route: FavoriteRoute) {
    this.router.navigate(['/plan-trip'], {
      queryParams: {
        fromName: route.from_stop_name,
        fromLat: route.from_lat,
        fromLon: route.from_lon,
        toName: route.to_stop_name,
        toLat: route.to_lat,
        toLon: route.to_lon
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.favorites.set([]);
    this.authForm.reset();
  }
}