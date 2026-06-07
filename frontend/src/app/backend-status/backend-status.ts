import { Component, OnInit, signal } from '@angular/core';

interface BackendStatus {
  working: boolean;
  time: string;
}

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [],
  templateUrl: './backend-status.html',
  styleUrl: './backend-status.css',
})
export class BackendStatusComponent implements OnInit {
  status = signal<BackendStatus | null>(null);
  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    try {
      const response = await fetch('http://localhost:3000/api/status');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data: BackendStatus = await response.json();
      
      this.status.set(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      this.errorMessage.set('Could not connect to the backend server.');
    }
  }
}