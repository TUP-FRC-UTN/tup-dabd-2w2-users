import {Component, inject} from '@angular/core';
import {MainContainerComponent, ToastService} from "ngx-dabd-grupo01";
import {UserService} from "../../../../../services/user.service";
import {User} from "../../../../../models/user";
import {NgClass} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {routes} from "../../../../../app.routes";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-users-created-by-user',
  standalone: true,
  imports: [
    MainContainerComponent,
    NgClass,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './users-created-by-user.component.html',
  styleUrl: './users-created-by-user.component.css'
})
export class UsersCreatedByUserComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService)

  users!: User[]
  userName!: string;

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 9
  sizeOptions : number[] = [3, 6, 9]
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];

    if (id) {
      this.userService.getUserById(id).subscribe({
        next: result => {
          this.userName = result.firstName + " " + result.lastName
        }
      })
      this.userService.getAllUsers(this.currentPage, this.pageSize, true).subscribe({
        next: result => {
          this.users = result.content;
          this.totalItems = result.totalElements;
        }
      })
    } else {
      this.toastService.sendError("Error al cargar la pagina, reintente.")
    }
  }

  redirectToDetail(id?: number) {
    if (id) {
      this.router.navigate([`/user/detail/${id}`])
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.ngOnInit();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.ngOnInit();
  }
}
