import { AuthResponse, User } from '../models/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'tm_token';
  private readonly USER_KEY  = 'tm_user';
  private readonly TOKEN_EXPIRY_KEY = 'tm_token_expiry';
  private readonly TOKEN_EXPIRY_TIME = 3600000; // 1 hora em milissegundos

  private currentUserSubject = new BehaviorSubject<User | null>(this.storedUser());
  currentUser$ = this.currentUserSubject.asObservable();
  private expiryTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenExpiry();
  }

  get token(): string | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiry) return false;
      const expiryTime = parseInt(expiry, 10);
      if (isNaN(expiryTime)) return false;
      return new Date().getTime() > expiryTime;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}auth/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(user: User): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}auth/register`, user)
      .pipe(tap(res => this.saveSession(res)));
  }

  logout(){
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.currentUserSubject.next(null);
  }

  private saveSession(res: AuthResponse): void {
    const expiryTime = new Date().getTime() + this.TOKEN_EXPIRY_TIME;
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    this.currentUserSubject.next(res.user);
    this.setupTokenExpiry();
  }

  private setupTokenExpiry(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }
    // Expira token automaticamente após 1 hora
    this.expiryTimer = setTimeout(() => {
      this.logout();
    }, this.TOKEN_EXPIRY_TIME);
  }

  private checkTokenExpiry(): void {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiry) {
      const remainingTime = parseInt(expiry) - new Date().getTime();
      if (remainingTime > 0) {
        this.expiryTimer = setTimeout(() => {
          this.logout();
        }, remainingTime);
      } else if (this.isLoggedIn) {
        this.logout();
      }
    }
  }

  private setupSessionCleanup(): void {
    // Limpa a sessão ao fechar a aba/janela
    // Removido: não limpar o localStorage ao recarregar a página
    // (manter o token para que o usuário não precise fazer login a cada reload)
  }

  private storedUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    if (raw === 'undefined' || raw === 'null') {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Erro ao recuperar usuário do storage:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
