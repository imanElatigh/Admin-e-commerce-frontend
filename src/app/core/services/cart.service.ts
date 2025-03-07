import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartKey = 'shopping_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$: Observable<CartItem[]> =
    this.cartItemsSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadCartFromLocalStorage();
  }

  private loadCartFromLocalStorage(): void {
    if (this.isBrowser) {
      const storedCart = localStorage.getItem(this.cartKey);
      if (storedCart) {
        try {
          const cartItems = JSON.parse(storedCart);
          this.cartItemsSubject.next(cartItems);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          this.cartItemsSubject.next([]);
        }
      }
    }
  }

  private saveCartToLocalStorage(cartItems: CartItem[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
    }
    this.cartItemsSubject.next(cartItems);
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }

  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.getCartItems();
    const existingItemIndex = currentCart.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists in cart
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      currentCart.push({ product, quantity });
    }

    this.saveCartToLocalStorage(currentCart);
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.getCartItems();
    const existingItemIndex = currentCart.findIndex(
      (item) => item.product.id === productId
    );

    if (existingItemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        currentCart.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        currentCart[existingItemIndex].quantity = quantity;
      }
      this.saveCartToLocalStorage(currentCart);
    }
  }

  removeFromCart(productId: number): void {
    const currentCart = this.getCartItems();
    const updatedCart = currentCart.filter(
      (item) => item.product.id !== productId
    );
    this.saveCartToLocalStorage(updatedCart);
  }

  clearCart(): void {
    this.saveCartToLocalStorage([]);
  }
}
