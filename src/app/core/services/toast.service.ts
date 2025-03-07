import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private currentId = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() {}

  /**
   * Show a success toast
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show a toast notification
   */
  private show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number
  ): void {
    const id = this.currentId++;
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  /**
   * Remove a toast by id
   */
  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id));
  }
}
