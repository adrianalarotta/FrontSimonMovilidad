import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8000/api';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string, role: string }>(`${this.baseUrl}/login/`, { username, password });
  }
  

  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 Usuario desde localStorage:', user);
    return user?.role === 'admin';
  }
  
  

  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
  
    const user = localStorage.getItem('user');
    if (!user) return false;
  
    try {
      const parsed = JSON.parse(user);
      return !!parsed?.token;
    } catch {
      return false;
    }
  }
  
}
