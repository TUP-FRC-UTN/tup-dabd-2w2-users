import {Component, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmAlertComponent, MainContainerComponent, ToastService} from 'ngx-dabd-grupo01';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {UserService} from "../../../../../services/user.service";
import {UsersUserFilterButtonsComponent} from "../users-user-filter-buttons/users-user-filter-buttons.component";
import {User} from "../../../../../models/user";
import {CadastreExcelService} from "../../../../../services/cadastre-excel.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-user-user-list',
  standalone: true,
  imports: [UsersUserFilterButtonsComponent, MainContainerComponent, NgbPagination, FormsModule],
  templateUrl: './user-user-list.component.html',
  styleUrl: './user-user-list.component.css'
})
export class UserUserListComponent {
    //#region SERVICIOS
    private router = inject(Router)
    private userService = inject(UserService)
    private toastService = inject(ToastService)
    private modalService = inject(NgbModal)
    //#endregion

    //#region ATT de PAGINADO
    currentPage: number = 0
    pageSize: number = 10
    sizeOptions : number[] = [10, 25, 50]
    usersList: User[] = [];
    filteredUsersList: User[] = [];
    lastPage: boolean | undefined
    totalItems: number = 0;
    //#endregion

    //#region ATT de ACTIVE
    retrieveUsersByActive: boolean | undefined = true;
    //#endregion

    //#region NgOnInit | BUSCAR
    ngOnInit() {
      this.getAllUsers();
    }

    ngAfterViewInit(): void {
      this.filterComponent.filter$.subscribe((filteredList: User[]) => {
        this.filteredUsersList = filteredList;
        this.currentPage = 0;
      });
    }

    @ViewChild('filterComponent') filterComponent!: UsersUserFilterButtonsComponent<User>;
    @ViewChild('usersTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;
    //#endregion

    //#region GET_ALL
    getAllUsers() {
      this.userService.getAllUsers(this.currentPage - 1, this.pageSize, this.retrieveUsersByActive).subscribe(
        response => {
          this.usersList = response.content.reverse();
          this.filteredUsersList = [...this.usersList].reverse();
          this.lastPage = response.last
          this.totalItems = response.totalElements;
        },
        error => {
          console.error('Error getting users:', error);
        }
      )
    }
    //#endregion

    //#region APLICACION DE FILTROS
    changeActiveFilter(isActive? : boolean) {
      this.retrieveUsersByActive = isActive
      this.getAllUsers();
    }
    //#endregion

    //#region DELETE
    assignUserToDelete(user: User) {
      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle='Confirmacion';
      modalRef.componentInstance.alertMessage=`Estas seguro que desea eliminar el usuario?`;
      modalRef.componentInstance.alertVariant='delete'

      modalRef.result.then((result) => {
        if (result && user.id) {

        this.userService.deleteUser(user.id, 1).subscribe(
          response => {
            this.toastService.sendSuccess('Usuario eliminado correctamente.')
          }, error => {
            this.toastService.sendError('Error al eliminar usuario.')
          }
        );
        }
      })
    }
    //#endregion

    //#region RUTEO
    updateUser(userId?: number) {
      this.router.navigate([`/user/form/${userId}`])
    }

    userDetail(userId? : number) {
      this.router.navigate([`/user/detail/${userId}`])
    }
    //#endregion

    //#region REACTIVAR
    reactivateUser(userId? : number) {
      // this.plotService.reactivatePlot(plotId, 1).subscribe(
      //   response => {
      //     location.reload();
      //   }
      // );
    }
    //#endregion

    //#region FUNCIONES PARA PAGINADO
    onItemsPerPageChange() {
      this.currentPage = 1;
      this.getAllUsers();
    }

    onPageChange(page: number) {
      this.currentPage = page;
      this.getAllUsers();
    }
    //#endregion

    //#region SHOW INFO | TODO
    showInfo() {
      // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
    }
    //#endregion

  //#region POR ACOMODAR

  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647

  itemsList!: User[];
  formPath: string = "";
  objectName : string = ""
  dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<T[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  private dataMapper = (item: T) => [
    item["plotNumber"],
    item["blockNumber"],
    item["totalArea"],
    item['builtArea'],
    item["plotStatus"],
    item["plotType"]
  ];

  // Se va a usar para los nombres de los archivos.
  getActualDayFormat() {
    const today = new Date();

    const formattedDate = today.toISOString().split('T')[0];

    return formattedDate;
  }

  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {
    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToPdf(response.content, `${this.getActualDayFormat()}_${this.objectName}`, [], this.dataMapper);
      },
      error => {
        console.log("Error retrieved all, on export component.")

      }
    )
  }

  exportToExcel() {
    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToExcel(response.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error => {
        console.log("Error retrieved all, on export component.")
      }
    )
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.value?.length <= 2) {
      this.filterSubject.next(this.itemsList);
    } else {
      const filterValue = target.value.toLowerCase();

      const filteredList = this.itemsList.filter(item => {
        return Object.values(item).some(prop => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          const translations = this.dictionaries && this.dictionaries.length
            ? this.dictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
            : [];

          return propString.includes(filterValue) || translations.some(trans => trans?.toLowerCase().includes(filterValue));
        });
      });

      this.filterSubject.next(filteredList.length > 0 ? filteredList : []);
    }
  }

  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    if (value !== undefined && value !== null && dictionary) {
      for (const key in dictionary) {
        if (dictionary[key].toString().toLowerCase() === value.toLowerCase()) {
          return key;
        }
      }
    }
    return;
  }

  redirectToForm() {
    this.router.navigate([this.formPath]);
  }

  //#endregion
}
