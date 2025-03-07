import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(private router: Router) {}

  logout(): void {
    // Clear authentication data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
