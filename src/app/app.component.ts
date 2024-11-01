import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {MainLayoutComponent, NavbarItem, ToastsContainer} from 'ngx-dabd-grupo01';
import { SessionService } from './services/session.service';
import {AsyncPipe, CommonModule} from '@angular/common';
import {SidebarComponent} from "./components/common/sidebar/sidebar.component";
import {NavbarComponent} from "./components/common/navbar/navbar.component";
import {HttpClientModule} from "@angular/common/http";
import {LoginComponent} from "./components/repositories/users/login/login.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsContainer, SidebarComponent, NavbarComponent,
    RouterOutlet, AsyncPipe, CommonModule, RouterLink, LoginComponent, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'users-cadastre-addresses-TPI';

  navbarMenu: NavbarItem[] = [
    {
      label: 'Usuarios',
      sidebarMenu: [
        {
          label: 'Propietarios',
          subMenu: [
            { label: 'Lista de Propietarios', routerLink: '/owner/list' },
            { label: 'Cargar Propietario', routerLink: '/owner/form' },
            { label: 'Cargar Archivo', routerLink: '/files/form' },
            { label: 'Validar Archivos', routerLink: '/files/view' },
          ]
        },
        {
          label: 'Lotes',
          subMenu: [
            { label: 'Lista de Lotes', routerLink: '/plot/list' },
            { label: 'Cargar Lote', routerLink: '/plot/form' },
          ]
        },
        {
          label: 'Usuarios',
          subMenu: [
            { label: 'Lista de Usuarios', routerLink: '/user/list' },
            { label: 'Cargar Usuario', routerLink: '/user/form' },
            { label: 'Cargar Usuario Inquilino', routerLink: '/user/tenant/form' },
            { label: 'Lista de Roles', routerLink: '/roles/list' },
            { label: 'Cargar Roles', routerLink: '/roles/form' },
          ]
        },
        {
          label: 'Cuentas',
          subMenu: [
            { label: 'Lista de Cuentas', routerLink: '/account/list' },
          ]
        }
      ]
    }
  ];


  /**
   * Service responsible for managing user session and authentication state.
   */
  private sessionService = inject(SessionService);

  /**
   * Observable that emits the current authentication status.
   * This observable updates automatically whenever the session state changes,
   * providing real-time authentication status across components.
   */
  isAuthenticated$ = this.sessionService.isAuthenticated$;

}

