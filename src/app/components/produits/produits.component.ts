import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

import { HttpClientModule } from '@angular/common/http';
import {
  Product,
  ProductService,
  PageResponse,
} from '../../core/services/product.service';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    HttpClientModule,
  ],
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css'],
})
export class ProduitsComponent implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  isModalOpen = false;
  isEditing = false;
  imageFile: File | null = null;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.maxLength(1000)],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      image: [''],
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService
      .getAllProducts(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Product>) => {
          this.products = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products', error);
          this.errorMessage = 'Failed to load products. Please try again.';
          this.loading = false;
        },
      });
  }

  openModal(): void {
    this.isEditing = false;
    this.productForm.reset({
      id: null,
      name: '',
      category: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      image: '',
    });
    this.imageFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.imageFile = null;
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      image: product.image,
    });
    this.isModalOpen = true;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imageFile = input.files[0];
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formData = new FormData();

    // Create the JSON request payload for the product data
    const productData = {
      name: this.productForm.get('name')?.value,
      category: this.productForm.get('category')?.value,
      description: this.productForm.get('description')?.value,
      price: this.productForm.get('price')?.value,
      stockQuantity: this.productForm.get('stockQuantity')?.value,
    };

    // Append the JSON data as a string with key 'request'
    formData.append(
      'request',
      new Blob([JSON.stringify(productData)], {
        type: 'application/json',
      })
    );

    // Append the image file if selected
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.loading = true;

    if (this.isEditing) {
      const productId = this.productForm.get('id')?.value;

      // For edit, we need to add the ID to the product data
      this.productService.updateProduct(productId, formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating product', error);
          this.errorMessage = 'Failed to update product. Please try again.';
          this.loading = false;
        },
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating product', error);
          this.errorMessage = 'Failed to create product. Please try again.';
          this.loading = false;
        },
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting product', error);
          this.errorMessage = 'Failed to delete product. Please try again.';
          this.loading = false;
        },
      });
    }
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getCategoryTranslation(category: string): string {
    switch (category) {
      case 'ALIMENTAIRE':
        return 'Alimentaire';
      case 'ELECTROMENAGER':
        return 'Électroménager';
      case 'ELECTRONIQUE':
        return 'Électronique';
      default:
        return category;
    }
  }
}
