// Todo status enum
export enum TodoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Todo interface
export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  status: TodoStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId: string;
}

// Pagination metadata interface
export interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

// Generic API response type
export interface ApiResponse<T> {
  data: T;
  meta?: Meta;
  message?: string;
}

// User interface (for authenticated user)
export interface User {
  id: string;
  email: string;
  name?: string;
}
