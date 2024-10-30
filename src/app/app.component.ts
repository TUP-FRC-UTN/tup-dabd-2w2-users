import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastsContainer } from 'ngx-dabd-grupo01';
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
    RouterOutlet, AsyncPipe, CommonModule, RouterLink, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'users-cadastre-addresses-TPI';

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

