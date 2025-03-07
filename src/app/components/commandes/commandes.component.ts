import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import {
  Order,
  OrderService,
  OrderStatus,
  PageResponse,
} from '../../core/services/order.service';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css'],
})
export class CommandesComponent implements OnInit {
  // Add Math to template
  Math = Math;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  showOrderDetails = false;
  statusFilter = 'all';
  loading = false;
  errorMessage = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.showOrderDetails) {
      this.closeOrderDetails();
    }
  }

  loadOrders(): void {
    this.loading = true;

    // Convert status filter to API status if not 'all'
    const apiStatus =
      this.statusFilter !== 'all'
        ? (this.statusFilter.toUpperCase() as OrderStatus)
        : undefined;

    this.orderService
      .getAllOrders(this.currentPage, this.pageSize, apiStatus)
      .subscribe({
        next: (response: PageResponse<Order>) => {
          this.orders = response.content;
          this.filteredOrders = this.orders; // No need to filter again as API does filtering
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders', error);
          this.errorMessage = 'Failed to load orders. Please try again.';
          this.loading = false;
        },
      });
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter = select.value;
    this.currentPage = 0; // Reset to first page when filter changes
    this.loadOrders();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page when size changes
    this.loadOrders();
  }

  viewOrderDetails(orderId: number): void {
    this.loading = true;
    this.showOrderDetails = true; // Show sidebar immediately with loading state

    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details', error);
        this.errorMessage = 'Failed to load order details. Please try again.';
        this.loading = false;
        this.showOrderDetails = false;
      },
    });
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    // Wait for sidebar animation to complete before clearing the data
    setTimeout(() => {
      if (!this.showOrderDetails) {
        this.selectedOrder = null;
      }
    }, 300);
  }

  getStatusTranslation(status: string): string {
    return this.orderService.getStatusTranslation(status);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  calculateTotalItems(order: Order): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      // If no date is available, return today's date
      return new Date().toLocaleDateString();
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' MRU';
  }

  deleteOrder(orderId: number, event: Event): void {
    event.stopPropagation(); // Prevent opening details when clicking delete
    event.preventDefault();

    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.loading = true;
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          // Reload orders after deletion
          this.loadOrders();
          this.loading = false;

          // If we're deleting the currently viewed order, close the sidebar
          if (this.selectedOrder && this.selectedOrder.id === orderId) {
            this.closeOrderDetails();
          }
        },
        error: (error) => {
          console.error('Error deleting order', error);
          this.errorMessage = 'Failed to delete order. Please try again.';
          this.loading = false;
        },
      });
    }
  }

  updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    event: Event
  ): void {
    event.preventDefault();
    event.stopPropagation(); // Prevent opening details when clicking update

    this.loading = true;
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        // Update order in the list
        const index = this.orders.findIndex((order) => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }

        // If showing details of this order, update the details too
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder = updatedOrder;
        }

        // If filter is active and updated status doesn't match, reload the list
        if (
          this.statusFilter !== 'all' &&
          this.statusFilter.toUpperCase() !== updatedOrder.status
        ) {
          this.loadOrders();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating order status', error);
        this.errorMessage = 'Failed to update order status. Please try again.';
        this.loading = false;
      },
    });
  }

  // Pagination navigation methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  get pagesArray(): number[] {
    const pages = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are few pages
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More complex logic for many pages
      let startPage = Math.max(
        0,
        this.currentPage - Math.floor(maxPagesToShow / 2)
      );
      let endPage = Math.min(
        this.totalPages - 1,
        startPage + maxPagesToShow - 1
      );

      // Adjust if we're near the end
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
