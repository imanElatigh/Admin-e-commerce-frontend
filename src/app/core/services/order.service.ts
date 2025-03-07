import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  priceAtOrder: number;
}

export interface User {
  id: number;
  fullName: string;
  phone: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: number;
  user: User;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  orderItems: OrderItem[];
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all orders with pagination
   * @param page Page number (starting from 0)
   * @param size Number of items per page
   * @param status Optional status filter
   * @returns Observable of PageResponse<Order>
   */
  getAllOrders(
    page: number = 0,
    size: number = 10,
    status?: OrderStatus
  ): Observable<PageResponse<Order>> {
    let url = '/api/orders';

    // Add query parameters
    const queryParams: string[] = [];
    queryParams.push(`page=${page}`);
    queryParams.push(`size=${size}`);

    if (status) {
      queryParams.push(`status=${status}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    return this.apiService
      .get<PageResponse<Order>>(url)
      .pipe(map((response) => this.formatResponse(response, page, size)));
  }

  /**
   * Get an order by ID
   * @param id Order ID
   * @returns Observable of Order
   */
  getOrderById(id: number): Observable<Order> {
    return this.apiService.get<Order>(`/api/orders/${id}`);
  }

  /**
   * Update order status
   * @param id Order ID
   * @param status New status
   * @returns Observable of Order
   */
  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.apiService.patch<Order>(`/api/orders/${id}`, { status });
  }

  /**
   * Delete an order
   * @param id Order ID
   * @returns Observable of any
   */
  deleteOrder(id: number): Observable<any> {
    return this.apiService.delete<any>(`/api/orders/${id}`);
  }

  /**
   * Get translated status text
   * @param status Status code
   * @returns Translated status text
   */
  getStatusTranslation(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PROCESSING':
        return 'En traitement';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }

  /**
   * Get status CSS class
   * @param status Status code
   * @returns CSS class for the status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'CONFIRMED':
        return 'confirmed';
      case 'PROCESSING':
        return 'processing';
      case 'SHIPPED':
        return 'shipped';
      case 'DELIVERED':
        return 'delivered';
      case 'CANCELLED':
        return 'canceled';
      default:
        return '';
    }
  }

  /**
   * Helper method to format API responses to the expected PageResponse format
   * @param response The API response
   * @param page Current page number
   * @param size Page size
   * @returns Formatted PageResponse<Order>
   */
  private formatResponse(
    response: any,
    page: number,
    size: number
  ): PageResponse<Order> {
    // If the response is already in the expected format, return it
    if (response && response.content && Array.isArray(response.content)) {
      return response;
    }
    // If the response is an array, convert it to the expected format
    else if (Array.isArray(response)) {
      return {
        content: response,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        last: response.length < size,
        totalPages:
          Math.ceil(response.length / size) +
          (response.length === size ? 1 : 0),
        totalElements: response.length + (response.length === size ? size : 0),
        size: size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        first: page === 0,
        numberOfElements: response.length,
        empty: response.length === 0,
      };
    }
    // Fallback for unexpected response format
    else {
      console.error('Unexpected API response format', response);
      return {
        content: [],
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        first: page === 0,
        numberOfElements: 0,
        empty: true,
      };
    }
  }
}
