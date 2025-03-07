import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api.service';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

// Define more specific interfaces with index signatures to satisfy TypeScript
export interface OrderStats {
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
  total: number;
  [key: string]: number; // Index signature to allow string indexing
}

export interface ProductCounts {
  ALIMENTAIRE: number;
  ELECTROMENAGER: number;
  ELECTRONIQUE: number;
  total: number;
  [key: string]: number; // Index signature to allow string indexing
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface DashboardStats {
  productCounts: ProductCounts;
  orderStats: OrderStats;
  recentOrders: any[]; // You might want to define an Order interface here
  salesData: ChartData;
  trafficSources: ChartData;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  /**
   * Get all dashboard statistics in one call
   */
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      products: this.productService.getAllProducts(0, 1000),
      orders: this.orderService.getAllOrders(0, 1000),
    }).pipe(
      map((results) => {
        const { products, orders } = results;

        // Process product counts by category
        const productCounts: ProductCounts = {
          ALIMENTAIRE: 0,
          ELECTROMENAGER: 0,
          ELECTRONIQUE: 0,
          total: products.content?.length || 0,
        };

        products.content?.forEach((product) => {
          if (product.category) {
            productCounts[product.category]++;
          }
        });

        // Process order counts by status
        const orderStats: OrderStats = {
          PENDING: 0,
          CONFIRMED: 0,
          PROCESSING: 0,
          SHIPPED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
          total: orders.totalElements || 0,
        };

        orders.content?.forEach((order) => {
          if (order.status) {
            orderStats[order.status]++;
          }
        });

        // Sample data for charts (can be replaced with real data)
        // Last 5 months for sales data
        const months = this.getLast5Months();
        const salesData: ChartData = {
          labels: months,
          data: this.generateMonthlySalesData(orders.content || [], months),
        };

        // Traffic sources demo data
        const trafficSources: ChartData = {
          labels: ['Direct', 'Social Media', 'Search'],
          data: [40, 35, 25],
        };

        return {
          productCounts,
          orderStats,
          recentOrders: orders.content?.slice(0, 5) || [], // Last 5 orders
          salesData,
          trafficSources,
        };
      })
    );
  }

  /**
   * Get array of last 5 month names
   */
  private getLast5Months(): string[] {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const today = new Date();
    const currentMonth = today.getMonth();

    const result = [];
    for (let i = 4; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      result.push(months[monthIndex]);
    }

    return result;
  }

  /**
   * Generate sample monthly sales data based on orders
   * In a real app, this would come from the backend
   */
  private generateMonthlySalesData(orders: any[], months: string[]): number[] {
    // This is a simplified example - in a real app, you'd process actual order dates
    // For now, we'll just evenly distribute the orders we have across the months
    const totalOrders = orders.length;
    const averageOrdersPerMonth = Math.ceil(totalOrders / 5);

    return months.map((_, index) => {
      // Add some randomness for a more realistic chart
      const variability = Math.random() * 0.5 + 0.75; // Between 0.75 and 1.25
      return Math.round(averageOrdersPerMonth * variability);
    });
  }
}
