import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MainContainerComponent} from 'ngx-dabd-grupo01';
import {AccountService} from "../../../../services/account.service";
import {PlotService} from "../../../../services/plot.service";
import {Account} from "../../../../models/account";
import { InfoComponent } from '../../../common/info/info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-account-account-list',
  standalone: true,
  imports: [CommonModule, MainContainerComponent],
  templateUrl: './account-account-list.component.html',
  styleUrl: './account-account-list.component.css'
})
export class AccountAccountListComponent {
  private accountService = inject(AccountService);
  private plotService = inject(PlotService)
  private router = inject(Router)
  private modalService = inject(NgbModal)

  currentPage: number = 0
  pageSize: number = 10
  plotId: number | undefined
  accountList: Account[] = [];
  lastPage: boolean = false;

  ngOnInit() {
    this.getAllAcounts()
  }

  getAllAcounts() {
    // TODO: Cuando le pegues el getAll vas a tener que hacer un
    // getById en el servicio de plots y rellenar los campos de nro manzana
    // y nro de lote.
    this.accountList = this.accountService.getAllPlots();
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

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });  
    
    modalRef.componentInstance.title = 'Lista de Cuentas';
    modalRef.componentInstance.description = 'Esta pantalla permite la visualización de los balances de las cuentas corrientes de los lotes. Los balances positivos representan el saldo a favor que tiene el lote, y los balences negativos representan las deudas de los mismos. Por cada registro de la tabla se pueden realizar distintas acciones.';
    modalRef.componentInstance.body = [
      { 
        title: 'Acciones', 
        content: [
          {
            strong: 'Detalle:',
            detail: 'Redirige hacia el listado para ver detallados los gastos del lote.'
          },
          {
            strong: 'Ver lote:',
            detail: 'Redirige hacia la página para ver los datos del lotes de manera detallada'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los gastos, manteniendo la integridad y precisión de los datos financieros.'
    ];

    
  }
}
