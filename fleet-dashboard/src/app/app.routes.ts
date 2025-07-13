import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MapComponent } from './dashboard/map/map.component';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { ChartsComponent } from './dashboard/charts/charts.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {path: 'dashboard',component: MapComponent,canActivate: [authGuard]  },
  { path: 'charts', component: ChartsComponent, canActivate: [authGuard] }
];
