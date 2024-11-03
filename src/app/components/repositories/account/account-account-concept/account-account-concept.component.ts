import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, Location} from '@angular/common';
import {MainContainerComponent} from 'ngx-dabd-grupo01';
import {AccountService} from "../../../../services/account.service";
import {AccountingConcept, ConceptTypes} from "../../../../models/account";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoComponent } from '../../../common/info/info.component';

@Component({
  selector: 'app-account-account-concept',
  standalone: true,
  imports: [CommonModule, MainContainerComponent],
  templateUrl: './account-account-concept.component.html',
  styleUrl: './account-account-concept.component.css'
})
export class AccountAccountConceptComponent {
  private accountService = inject(AccountService);
  private router = inject(Router)
  private location = inject(Location)
  private modalService = inject(NgbModal)

  currentPage: number = 0
  pageSize: number = 10
  plotId: number | undefined
  conceptList: AccountingConcept[] = [];
  lastPage: boolean = false;

  conceptTypesDictionary = ConceptTypes;

  ngOnInit() {
    this.getAllAcounts()
  }

  getAllAcounts() {
    this.conceptList = this.accountService.getConceptByAccountId(1);
  }

  changePage(forward: boolean) {
    forward ? this.currentPage++ : this.currentPage--
  }

  viewPlotDetail(plotId : number) {
    this.router.navigate(["/plot/detail/" + plotId])
  }

  viewConcept(accountId : number) {
    this.router.navigate(["/account/concept/" + accountId])
  }

  goBack() {
    this.location.back();
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('es-AR', options).format(date);
  }

  translateTable(value: any, dictionary: { [key: string]: any }) {
    if (value !== undefined && value !== null) {
      for (const key in dictionary) {
        if (dictionary[key] === value) {
          return key;
        }
      }
    }
    console.log("Algo salio mal.");
    return;
  }

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    }); 
    
    
    modalRef.componentInstance.title = 'Lista de Gastos';
    modalRef.componentInstance.description = 'Esta pantalla permite la visualización de todos los gastos asociados al lote.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos', 
        content: [
          {
            strong: 'Fecha:',
            detail: 'Fecha en la que se registró el gasto.'
          },
          {
            strong: 'Tipo de Gasto:',
            detail: 'Clasificación del gasto (Pago, Expensa Común, Expensa Extraordinaria).'
          },
          {
            strong: 'Comentarios:',
            detail: 'Descripción breve o comentario asociado al gasto.'
          },
          {
            strong: 'Balance:',
            detail: 'Monto del gasto, mostrando valores negativos en rojo y valores positivos en verde.'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Volver: ',
            detail: 'Botón para volver hacia la vista anterior.'
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los gastos, manteniendo la integridad y precisión de los datos financieros.'
    ];
    
  }
}
