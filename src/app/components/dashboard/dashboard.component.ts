import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

import { NgApexchartsModule } from 'ng-apexcharts';
import {
  DashboardStats,
  DashboardService,
} from '../../core/services/dashboard.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  // Chart options
  barChartOptions: any;
  pieChartOptions: any;

  // Order status colors
  statusColors = {
    PENDING: '#FFA500', // Orange
    CONFIRMED: '#4CAF50', // Green
    PROCESSING: '#2196F3', // Blue
    SHIPPED: '#9C27B0', // Purple
    DELIVERED: '#009688', // Teal
    CANCELLED: '#F44336', // Red
  };

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.initCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      },
    });
  }

  initCharts(): void {
    if (!this.stats) return;


    this.barChartOptions = {
      series: [
        {
          name: 'Orders',
          data: this.stats.salesData.data,
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#4CAF50'],
      xaxis: {
        categories: this.stats.salesData.labels,
      },
      yaxis: {
        title: {
          text: 'Number of Orders',
        },
      },
      title: {
        text: 'Monthly Orders',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },
    };

    // Pie chart for order statuses
    const orderStats = this.stats.orderStats;
    const statusLabels = Object.keys(orderStats).filter(
      (key) => key !== 'total'
    );


    const statusValues = statusLabels.map((key) => {
      // Type assertion to handle index access
      return orderStats[key as keyof typeof orderStats];
    });

    const statusColorArray = statusLabels.map((status) => {
      // Type assertion to handle index access
      return (
        this.statusColors[status as keyof typeof this.statusColors] || '#999999'
      );
    });

    this.pieChartOptions = {
      series: statusValues,
      chart: {
        type: 'donut',
        height: 240,
      },
      labels: statusLabels.map((status) =>
        // Cast string to string (redundant but fixes TypeScript errors)
        this.orderService.getStatusTranslation(status as string)
      ),
      colors: statusColorArray,
      legend: {
        position: 'bottom',
      },
      title: {
        text: 'Orders by Status',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },
    };
  }

  // Get translation for status
  getStatusTranslation(status: string): string {
    return this.orderService.getStatusTranslation(status);
  }

  // Get CSS class for status
  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  // Format date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Format price
  formatPrice(price: number): string {
    return price.toFixed(2) + ' €';
  }
}
