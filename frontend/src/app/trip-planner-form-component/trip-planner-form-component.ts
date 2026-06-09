import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Importujemy Router

@Component({
  selector: 'app-trip-planner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-planner-form-component.html'
})
export class TripPlannerFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router); // Wstrzykujemy Router

  // Pobieramy czas z uwzględnieniem lokalnej strefy czasowej użytkownika
  private now = new Date();
  private localDate = this.now.getFullYear() + '-' + 
                      String(this.now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(this.now.getDate()).padStart(2, '0');
  private localTime = String(this.now.getHours()).padStart(2, '0') + ':' + 
                      String(this.now.getMinutes()).padStart(2, '0');

  searchForm: FormGroup = this.fb.group({
    fromLat: [50.34377, [Validators.required, Validators.min(-90), Validators.max(90)]],
    fromLon: [18.91225, [Validators.required, Validators.min(-180), Validators.max(180)]],
    toLat: [50.27091, [Validators.required, Validators.min(-90), Validators.max(90)]],
    toLon: [18.99703, [Validators.required, Validators.min(-180), Validators.max(180)]],
    date: [this.localDate, Validators.required],
    time: [this.localTime, Validators.required]
  });

  onSubmit() {
    console.log('Metoda onSubmit() w formularzu wywołana. Przekierowuję...');

    if (this.searchForm.valid) {
      const formValues = this.searchForm.value;
      
      // Zmieniamy adres URL na stronę wyświetlacza i dorzucamy parametry do paska adresu
      this.router.navigate(['/trip-planner-displayer'], {
        queryParams: {
          fromLat: formValues.fromLat,
          fromLon: formValues.fromLon,
          toLat: formValues.toLat,
          toLon: formValues.toLon,
          date: formValues.date,
          time: formValues.time
        }
      });
    } else {
      this.searchForm.markAllAsTouched();
    }
  }
}