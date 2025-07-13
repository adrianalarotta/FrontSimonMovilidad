import { bootstrapApplication} from '@angular/platform-browser';
import { inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/services/auth.service';
import { TokenInterceptor } from './app/services/token.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const auth = inject(AuthService);
          const token = auth.getToken(); // o como sea que accedas al token

          const clonedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });

          return next(clonedReq);
        }
      ])
    ),
  ],
}).catch((err) => console.error(err));
