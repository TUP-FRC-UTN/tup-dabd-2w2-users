import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { ToastService, MainContainerComponent } from 'ngx-dabd-grupo01';
import { NgClass } from '@angular/common';
import {Address, Contact, Owner, StateKYC} from "../../../../../models/owner";
import {Plot} from "../../../../../models/plot";
import {OwnerService} from "../../../../../services/owner.service";
import {PlotService} from "../../../../../services/plot.service";
import {docValidator} from "../../../../../validators/document-validator";
import {cuitValidator} from "../../../../../validators/cuit-validator";
import {plotForOwnerValidator} from "../../../../../validators/cadastre-plot-for-owner";
import {Country, Provinces} from "../../../../../models/generics";
import {mapOwnerType} from "../../../../../utils/object-helper";
import {cadastrePlotAssociation} from "../../../../../validators/cadastre-plot-association";
import {OwnerPlotService} from "../../../../../services/owner-plot.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoComponent } from '../../../../common/info/info.component';

@Component({
  selector: 'app-cadastre-owner-form',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent, NgClass],
  templateUrl: './cadastre-owner-form.component.html',
  styleUrl: './cadastre-owner-form.component.css'
})
export class CadastreOwnerFormComponent {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  private ownerPlotService = inject(OwnerPlotService)

  title: string = '';
  id: string | null = null;
  address!: Address;
  addresses: Address[] = [];
  addressIndex:number | undefined = undefined;
  ownerTypes: string[] = ['PERSON', 'COMPANY', 'OTHER'];
  contact!: Contact;
  contacts: Contact[] = [];
  contactIndex:number | undefined = undefined;
  owner: Owner = {
    id: undefined,
    firstName: '',
    secondName: '',
    lastName: '',
    ownerType: '',
    documentNumber: '',
    documentType: '',
    cuit: '',
    bankAccount: '',
    birthdate: '',
    // kycStatus: StateKYC.INITIATED, // TODO: CHECK UPDATE OBJECT
    // isActive: true,
    addresses: [],
    contacts: [],
    plotId: undefined
  };
  plot!: Plot;
  provinceOptions!: any;
  countryOptions!: any;

  protected ownerService = inject(OwnerService);
  protected plotService = inject(PlotService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal)

  ngOnInit(): void {
    this.setEnums();
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.title = "Editar Propietario"
      this.ownerService.getOwnerById(parseInt(this.id, 10)).subscribe({
        next: (response) => {
          this.owner = {
            id: response.id,
            firstName: response.firstName,
            secondName: response.secondName,
            lastName: response.lastName,
            ownerType: response.ownerType,
            documentNumber: response.documentNumber,
            documentType: response.documentType,
            cuit: response.cuit,
            bankAccount: response.bankAccount,
            birthdate: response.birthdate,
            addresses: response.addresses,
            contacts: response.contacts,
            plotId: response.plotId
          };
          this.fillFieldsToUpdate(this.owner);
        },
        error: (error) => {
          console.error('Error al obtener owners:', error);
          this.toastService.sendError('Error al obtener el propietario.');
        },
      });
    } else {
      this.title = "Registrar Propietario"
    }
  }

  ownerForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    secondName: new FormControl('', [Validators.maxLength(50)]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    ownerType: new FormControl('', [Validators.required]),
    documentNumber: new FormControl(
      '',
      [Validators.required, Validators.pattern('^[0-9]*$')],
      [docValidator(this.ownerService)]
    ),
    documentType: new FormControl('', [Validators.required]),
    cuit: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
      cuitValidator,
    ]),
    bankAccount: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]),
    birthdate: new FormControl('', [
      Validators.required,
      this.birthdateValidation,
    ]),
    kycStatus: new FormControl(StateKYC.INITIATED),
    isActive: new FormControl(false),

    plotForm: new FormGroup({
      plotNumber: new FormControl(
        '',
        [Validators.required, Validators.min(1)],
        [plotForOwnerValidator(this.plotService), cadastrePlotAssociation(this.ownerPlotService, this.plot?.id)]
      ),
      blockNumber: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
    }),
    contactsForm: new FormGroup({
      contactType: new FormControl('', [Validators.required]),
      contactValue: new FormControl('', [Validators.required]),
    }),
    addressForm: new FormGroup({
      streetAddress: new FormControl('', [Validators.required]),
      number: new FormControl(0, [Validators.required, Validators.min(0)]),
      floor: new FormControl(0),
      apartment: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      province: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      postalCode: new FormControl(0, [Validators.required]),
    }),
  });

  onSubmit(): void {
    this.id ? this.updateOwner() : this.createOwner();
    /* if (this.ownerForm.valid) {
      this.id
        ? this.updateOwner()
        : this.createOwner();
    } else {
     this.errorLogs()
    } */
  }

  onCancel(): void {
    this.router.navigate(['/owner/list']);
  }

  createOwner() {
    this.fillOwner();
    this.getPlotValues()
      .pipe(
        switchMap((plot) => {
          if (plot) {
            this.plot = plot;
            console.log(this.owner)
            this.owner.plotId = plot.id
            return this.ownerService.createOwner(this.owner, '1');
          } else {
            return [];
          }
        }),
        switchMap((owner) => {
          this.toastService.sendSuccess('Propietario creado');
          if (owner?.id) {
            return this.ownerService.linkOwnerWithPlot(
              owner.id,
              this.plot.id,
              '1'
            );
          } else {
            return [];
          }
        })
      )
      .subscribe({
        next: () => this.router.navigate(['/owner/list']),
        error: (error) => {
          this.toastService.sendError(
            'Error al vincular el propietario al lote.'
          );
          console.log('Error creating owner:', error);
        },
      });
  }

  updateOwner() {
    this.fillOwner();
    console.log('Owner->', this.owner);
    if (this.owner.id) {
      this.ownerService.updateOwner(this.owner.id, this.owner, '1').subscribe({
        next: (response) => {
          this.toastService.sendSuccess('Propietario actualizado');
          if (response.id) {
            this.ownerService
              .linkOwnerWithPlot(response.id, this.plot.id, '1')
              .subscribe();
          }
          this.router.navigate(['/owner/list']);
        },
        error: (error) => {
          this.toastService.sendError('Error al actualizar el propietario.');
          console.error('Error updating owner:', error);
        },
      });
    } else {
      this.toastService.sendError('Algo salio mal, intente nuevamente.');
    }
  }

  fillOwner() {
    this.owner.id = this.id ? parseInt(this.id) : undefined;
    (this.owner.firstName = this.ownerForm.get('firstName')?.value || ''),
      (this.owner.secondName = this.ownerForm.get('secondName')?.value || ''),
      (this.owner.lastName = this.ownerForm.get('lastName')?.value || ''),
      (this.owner.ownerType = this.ownerForm.get('ownerType')?.value || ''),
      (this.owner.documentNumber =
        this.ownerForm.get('documentNumber')?.value || ''),
      (this.owner.documentType =
        this.ownerForm.get('documentType')?.value || ''),
      (this.owner.cuit = this.ownerForm.get('cuit')?.value || ''),
      (this.owner.bankAccount = this.ownerForm.get('bankAccount')?.value || ''),
      (this.owner.birthdate = this.ownerForm.get('birthdate')?.value || ''),
      // (this.owner.kycStatus = undefined),
      // (this.owner.isActive = undefined),
      (this.owner.contacts = [...this.contacts]),
      (this.owner.addresses = [...this.addresses]);
  }

  fillFieldsToUpdate(owner: any): void {
    console.log('UPDATE->', owner);
    this.ownerForm.patchValue({
      firstName: owner.firstName,
      secondName: owner.secondName,
      lastName: owner.lastName,
      ownerType: owner.ownerType,
      documentNumber: owner.documentNumber,
      documentType: owner.documentType,
      cuit: owner.cuit,
      bankAccount: owner.bankAccount,
      birthdate: owner.birthdate,
      // kycStatus: owner.kycStatus,
      // isActive: owner.isActive,
    });
    const address: Address | null =
      owner.addresses.length > 0 ? owner.addresses[0] : null;
    this.ownerForm.get('addressForm')?.patchValue({
      streetAddress: address?.streetAddress ? address.streetAddress : '',
      number: address?.number ? address.number : null,
      floor: address?.floor ? address.floor : null,
      apartment: address?.apartment ? address.apartment : '',
      city: address?.city ? address.city : '',
      province: address?.province ? address.province : '',
      country: address?.country ? address.country : '',
      postalCode: address?.postalCode ? address.postalCode : null,
    });
    this.addresses = owner.addresses
    this.contacts = owner.contacts;
  }

  getAddressValues(): Address[] {
    const address: Address = {
      streetAddress:
        this.ownerForm.get('addressForm.streetAddress')?.value || '',
      number: this.ownerForm.get('addressForm.number')?.value || 0,
      floor: this.ownerForm.get('addressForm.floor')?.value || 0,
      apartment: this.ownerForm.get('addressForm.apartment')?.value || '',
      city: this.ownerForm.get('addressForm.city')?.value || '',
      province: this.ownerForm.get('addressForm.province')?.value || '',
      country: this.ownerForm.get('addressForm.country')?.value || '',
      postalCode: this.ownerForm.get('addressForm.postalCode')?.value || 0,
    };
    if (this.id) {
      address.id = this.owner.addresses[0].id;
    }
    return [address];
  }

  getPlotValues(): Observable<any> {
    const plotFormGroup = this.ownerForm.get('plotForm') as FormGroup;
    const blockNumber = +plotFormGroup.get('blockNumber')?.value;
    const plotNumber = +plotFormGroup.get('plotNumber')?.value;

    if (blockNumber && plotNumber) {
      return this.plotService
        .getPlotByPlotNumberAndBlockNumber(plotNumber, blockNumber)
        .pipe(
          tap((plot) => {
            this.plot = plot;
          }),
          catchError((error) => {
            console.error('Plot Error->', error);
            return of(null);
          })
        );
    } else {
      return of(null);
    }
  }

  setEnums() {
    this.provinceOptions = Object.entries(Provinces).map(([key, value]) => ({
      value: key,
      display: value,
    }));
    this.countryOptions = Object.entries(Country).map(([key, value]) => ({
      value: key,
      display: value,
    }));
  }

  birthdateValidation(control: AbstractControl): ValidationErrors | null {
    const fechaNacimiento = new Date(control.value);
    const fechaActual = new Date();
    return fechaNacimiento >= fechaActual ? { fechaInvalida: true } : null;
  }

  errorLogs() {
    const formErrors: { [key: string]: any } = {};
    Object.keys(this.ownerForm.controls).forEach((key) => {
      const controlErrors = this.ownerForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    console.log('Errores del formulario:', formErrors);
  }

  mapType(type: string) {
    return mapOwnerType(type);
  }

  //#region FUNCION CONTACTO
  setContactValue(index: number) {
    const contact = this.contacts[index];
    console.log(contact)
    if (contact) {
      const contactFormGroup = this.ownerForm.get('contactsForm') as FormGroup;

      contactFormGroup.patchValue({
        contactType: contact.contactType,
        contactValue: contact.contactValue,
      })

      this.contactIndex = index;
    }
  }

  getContactsValues(): Contact {
    const contactFormGroup = this.ownerForm.get('contactsForm') as FormGroup;
    return {
      contactType: contactFormGroup.get('contactType')?.value || '',
      contactValue: contactFormGroup.get('contactValue')?.value || '',
    };
  }

  addContact(): void {
    if (this.ownerForm.get('contactsForm')?.valid) {
      const contactValues = this.getContactsValues();
      if (this.contactIndex == undefined && contactValues) {
        this.contacts.push(contactValues);
      } else if (contactValues && this.contactIndex !== undefined) {
        this.contacts[this.contactIndex] = contactValues;
        this.contactIndex = undefined;
      }
      this.ownerForm.get('contactsForm')?.reset();
    } else {
      this.toastService.sendError("Contacto no valido.")
    }
  }

  cancelEditContact() {
    this.ownerForm.get('contactsForm')?.reset();
    this.contactIndex = undefined;
  }

  removeContact(index: number): void {
    this.contacts.splice(index, 1);
  }
  //#endregion

  //#region FUNCION ADDRESS
  removeAddress(index: number): void {
    if (this.id === null) {
      this.addresses.splice(index, 1);
    } else {

    }
  }

  getAddressValue(): Address {
    const postalCodeValue = this.ownerForm.get('addressForm.postalCode')?.value;
    const address: Address = {
      id: undefined, // Si no estás usando un ID, puedes omitirlo o definirlo
      streetAddress: this.ownerForm.get('addressForm.streetAddress')?.value || '',
      number: this.ownerForm.get('addressForm.number')?.value || 0,
      floor: this.ownerForm.get('addressForm.floor')?.value || 0,
      apartment: this.ownerForm.get('addressForm.apartment')?.value || '',
      city: this.ownerForm.get('addressForm.city')?.value || '',
      province: this.ownerForm.get('addressForm.province')?.value || '',
      country: this.ownerForm.get('addressForm.country')?.value || '',
      postalCode: postalCodeValue !== undefined && postalCodeValue !== null
        ? parseInt(postalCodeValue.toString(), 10)
        : null // Convertir a number o asignar null
    };
    return address;
  }

  setAddressValue(index: number) {
    const address = this.addresses[index];

    if (address) {
      const addressFormGroup = this.ownerForm.get('addressForm') as FormGroup;

      addressFormGroup.patchValue({
        streetAddress: address.streetAddress,
        number: address.number,
        floor: address.floor,
        apartment: address.apartment,
        city: address.city,
        province: address.province,
        country: address.country,
        postalCode: address.postalCode
      });
      this.addressIndex = index;
    }
  }

  addAddress(): void {
    if (this.ownerForm.get('addressForm')?.valid) {
      const addressValue = this.getAddressValue()
      if (this.addressIndex == undefined && addressValue) {
        this.addresses.push(addressValue);
      } else if (addressValue && this.addressIndex !== undefined) {
        this.addresses[this.addressIndex] = addressValue;
        this.addressIndex = undefined;
      }
      this.ownerForm.get('addressForm')?.reset();
    } else {
      this.toastService.sendError("Direccion no valida.")
    }
  }

  cancelEditionAddress() {
    this.addressIndex = undefined;
    this.ownerForm.get('addressForm')?.reset();
  }
  //#endregion

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });  
    
    modalRef.componentInstance.title = 'Registrar Propietario';
    modalRef.componentInstance.description = 'Pantalla para la gestión integral de propietarios, permitiendo la visualización, edición y administración de datos personales, información de contacto y detalles de dirección.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos del Propietario', 
        content: [
          {
            strong: 'Nombre:',
            detail: 'Campo para ingresar el nombre del propietario.'
          },
          {
            strong: 'Segundo nombre:',
            detail: 'Campo para ingresar el segundo nombre del propietario.'
          },
          {
            strong: 'Apellido:',
            detail: 'Campo para ingresar el apellido del propietario.'
          },
          {
            strong: 'Tipo Propietario:',
            detail: 'Menú desplegable para seleccionar el tipo de propietario.'
          },
          {
            strong: 'Tipo Documento:',
            detail: 'Menú desplegable para seleccionar el tipo de documento.'
          },
          {
            strong: 'Número:',
            detail: 'Campo para ingresar el número del documento.'
          },
          {
            strong: 'CUIT:',
            detail: 'Campo para ingresar el CUIT del propietario.'
          },
          {
            strong: 'Cuenta Bancaria:',
            detail: 'Campo para ingresar la cuenta bancaria del propietario.'
          },
          {
            strong: 'Fecha de Nacimiento:',
            detail: 'Campo para ingresar la fecha de nacimiento en formato dd/mm/aaaa.'
          }
        ]
      },
      { 
        title: 'Asociar un lote', 
        content: [
          {
            strong: 'Número de Manzana:',
            detail: 'Campo de texto para ingresar el número de manzana.'
          },
          {
            strong: 'Número de Lote:',
            detail: 'Campo de texto para ingresar el número de lote.'
          }
        ]
      },
      { 
        title: 'Añadir Dirección', 
        content: [
          {
            strong: 'Calle:',
            detail: 'Campo para ingresar el nombre de la calle.'
          },
          {
            strong: 'Número:',
            detail: 'Campo para ingresar el número, con valor predeterminado 0.'
          },
          {
            strong: 'Piso:',
            detail: 'Campo para ingresar el piso, con valor predeterminado 0.'
          },
          {
            strong: 'Depto:',
            detail: 'Campo para ingresar el número de departamento.'
          },
          {
            strong: 'País:',
            detail: 'Menú desplegable para seleccionar el país.'
          },
          {
            strong: 'Provincia:',
            detail: 'Menú desplegable para seleccionar la provincia.'
          },
          {
            strong: 'Ciudad:',
            detail: 'Campo para ingresar la ciudad.'
          },
          {
            strong: 'Código Postal:',
            detail: 'Campo para ingresar el código postal.'
          }
        ]
      },
      { 
        title: 'Añadir Contactos', 
        content: [
          {
            strong: 'Tipo Contacto:',
            detail: 'Menú desplegable para seleccionar el tipo de contacto.'
          },
          {
            strong: 'Contacto:',
            detail: 'Campo para ingresar el contacto.'
          },
          {
            strong: 'Agregar Contacto:',
            detail: 'Botón con símbolo de "+" para agregar el contacto ingresado.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = ['Campos obligatorios: Nombre, Apellido, Tipo Propietario, Tipo Documento, Número.'];    
  }

}
