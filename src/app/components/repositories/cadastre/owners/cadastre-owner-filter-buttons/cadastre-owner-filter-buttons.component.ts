import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import {CadastreExcelService} from "../../../../../services/cadastre-excel.service";
import {OwnerService} from "../../../../../services/owner.service";
import {Owner} from "../../../../../models/owner";

@Component({
  selector: 'app-cadastre-owner-filter-buttons',
  standalone: true,
  imports: [],
  templateUrl: './cadastre-owner-filter-buttons.component.html',
  styleUrl: './cadastre-owner-filter-buttons.component.css'
})
export class CadastreOwnerFilterButtonsComponent<T extends Record<string, any>> {


  private router = inject(Router);

  // Inject the Excel service for export functionality
  private excelService = inject(CadastreExcelService);

  // inject OwnerService
  private ownerService = inject(OwnerService);

  LIMIT_32BITS_MAX = 2147483647

  headers: string[] = ['Nombre', 'Apellido', 'Documento', 'Tipo propietario'];

  private dataMapper = (item: T) => [
    item['firstName'] + (item['secondName'] ? ' ' + item['secondName'] : ''),
    item['lastName'],
    this.translateDictionary(item['documentType'], this.dictionaries[0]) + ': ' + item['documentNumber'],
    this.translateDictionary(item['ownerType'], this.dictionaries[1])
  ]


  // Input to receive the HTML table from the parent
  @Input() tableName!: HTMLTableElement;

  // Input to receive the list of owners from the parent component
  @Input() ownersList!: Owner[];

  // Input to redirect to the form.
  @Input() formPath: string = "";
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName : string = ""
  // Represent the dictionaries of ur object.
  // Se va a usar para las traducciones de enum del back.
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<Owner[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();


  ngOnInit(): void {

  }

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
  exportToPdf(){
    this.ownerService.getOwners(0, this.LIMIT_32BITS_MAX, true).subscribe({
      next: (data) => {
        this.excelService.exportListToPdf(data.content, `${this.getActualDayFormat()}_${this.objectName}`, this.headers, this.dataMapper);
      },
      error: (error) => {
        console.log(error);        
      }
    });
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel(){
    this.ownerService.getOwners(0, this.LIMIT_32BITS_MAX, true).subscribe({
      next: (data) => {
        this.excelService.exportListToExcel(data.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error: (error) => {
        console.log(error);        
      }
    });
  }

  /**
   * Filters the list of owners based on the input value in the text box.
   * The filter checks if any property of the owner contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   *
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const filterValue = target.value.toLowerCase();

    let filteredList = this.ownersList.filter(owner => {
      return Object.values(owner).some(prop => {
        const propString = prop ? prop.toString().toLowerCase() : '';

        // Validar que dictionaries esté definido y tenga elementos antes de mapear
        const translations = this.dictionaries && this.dictionaries.length
          ? this.dictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
          : [];

        // Se puede usar `includes` para verificar si hay coincidencias
        return propString.includes(filterValue) || translations.some(trans => trans?.toLowerCase().includes(filterValue));
      });
    });

    this.filterSubject.next(filteredList);
  }

  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
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


  /**
   * Redirects to the specified form path.
   */
  redirectToForm() {
    this.router.navigate([this.formPath]);
  }
}
