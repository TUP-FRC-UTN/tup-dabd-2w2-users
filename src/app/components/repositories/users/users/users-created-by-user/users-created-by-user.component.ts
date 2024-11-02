import {Component, inject} from '@angular/core';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService
} from "ngx-dabd-grupo01";
import {UserService} from "../../../../../services/user.service";
import {User} from "../../../../../models/user";
import {DatePipe, NgClass} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {routes} from "../../../../../app.routes";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CadastreExcelService} from "../../../../../services/cadastre-excel.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-users-created-by-user',
  standalone: true,
  imports: [
    MainContainerComponent,
    NgClass,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    TableFiltersComponent,
    DatePipe

  ],
  providers: [DatePipe],
  templateUrl: './users-created-by-user.component.html',
  styleUrl: './users-created-by-user.component.css'
})
export class UsersCreatedByUserComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService)

  //TODO: Cambiar filtro porfavor
  filterConfig: Filter[] = new FilterConfigBuilder()
    .numberFilter('Nro. Manzana', 'plotNumber', 'Seleccione una Manzana')
    .selectFilter('Tipo', 'plotType', 'Seleccione un tipo', [
      {value: 'COMMERCIAL', label: 'Comercial'},
      {value: 'PRIVATE', label: 'Privado'},
      {value: 'COMMUNAL', label: 'Comunal'},
    ])
    .selectFilter('Estado', 'plotStatus', 'Seleccione un estado', [
      {value: 'CREATED', label: 'Creado'},
      {value: 'FOR_SALE', label: 'En Venta'},
      {value: 'SALE', label: 'Venta'},
      {value: 'SALE_PROCESS', label: 'Proceso de Venta'},
      {value: 'CONSTRUCTION_PROCESS', label: 'En construcciones'},
      {value: 'EMPTY', label: 'Vacio'},
    ])
    .radioFilter('Activo', 'isActive', [
      {value: 'true', label: 'Activo'},
      {value: 'false', label: 'Inactivo'},
      {value: 'undefined', label: 'Todo'},
    ])
    .build()
/*
    "Creado": "CREATED",
    "En Venta": "FOR_SALE",
    "Venta": "SALE",
    "Proceso de Venta": "SALE_PROCESS",
    "En construcciones": "CONSTRUCTION_PROCESS",
    "Vacio": "EMPTY"
 */

  userList!: User[]
  userName!: string;
  filteredUsersList: User[] = [];

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
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
          this.userList = result.content;
          this.filteredUsersList = this.userList
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

  userDetail(userId? : number) {
    this.router.navigate([`/user/detail/${userId}`])
  }

  //#region POR ACOMODAR

  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647

  itemsList!: User[];
  formPath: string = "";
  objectName : string = ""
  dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<User[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  headers : string[] = ['Nombre completo', 'Nombre de usuario', 'Email', 'Activo']

  private dataMapper = (item: User) => [
    item["firstName"] + ' ' + item["lastName"],
    item["userName"],
    item["email"],
    item['isActive']? 'Activo' : 'Inactivo',
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
  filterChange($event: Record<string, any>) {
    console.log($event)
  }
}
