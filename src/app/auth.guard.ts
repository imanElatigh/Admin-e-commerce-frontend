import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = this.decodeToken(token);
        if (decodedToken.role === 'ADMIN') {
          return true;
        } else {
          this.router.navigate(['/unauthorized']); // Redirect non-admins
          return false;
        }
      } catch (error) {
        console.error('Invalid token', error);
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1]; // Extract payload
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}
