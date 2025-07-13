import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('✅ Login exitoso', res);
        localStorage.setItem('user', JSON.stringify({
          token: res.token,
          role: res.role
        }));
  
        // Si viene de otra ruta protegida, redirige allá
        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
        if (redirectTo) {
          this.router.navigateByUrl(redirectTo);
        } else {
          this.router.navigate(['/']); // o /dashboard por defecto
        }
      },
      error: (err) => {
        this.error = 'Credenciales inválidas';
      },
    });
  }
  
  
  
}
