import { Component, inject, OnInit, signal } from '@angular/core'; // <-- Dodaj signal
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, FavoriteRoute } from '../auth-service';
import { Router } from '@angular/router';

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

  isMenuCollapsed = true;

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
    if (this.authService.isLoggedIn()) {
      await this.loadFavorites();
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
    this.authService.activeFavoriteRoute.set(route);
    this.router.navigate(['/plan-trip']);
  }

  onLogout() {
    this.authService.logout();
    this.favorites.set([]);
    this.authForm.reset();
  }
}