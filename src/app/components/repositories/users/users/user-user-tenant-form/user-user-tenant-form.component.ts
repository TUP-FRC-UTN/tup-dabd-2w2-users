import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MainContainerComponent, ToastService} from 'ngx-dabd-grupo01';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PlotService} from "../../../../../services/plot.service";
import {RoleService} from "../../../../../services/role.service";
import {UserService} from "../../../../../services/user.service";
import {OwnerPlotService} from "../../../../../services/owner-plot.service";
import {NgClass} from "@angular/common";
import {Address, Contact} from "../../../../../models/owner";
import {Role} from "../../../../../models/role";
import {Plot} from "../../../../../models/plot";
import {Country, Provinces} from "../../../../../models/generics";
import {emailValidator} from "../../../../../validators/email-unique-validator";
import {User} from "../../../../../models/user";
import {toSnakeCase} from "../../../../../utils/object-helper";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoComponent } from '../../../../common/info/info.component';


@Component({
  selector: 'app-user-user-tenant-form',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent, NgClass],
  templateUrl: './user-user-tenant-form.component.html',
  styleUrl: './user-user-tenant-form.component.css'
})
export class UserUserTenantFormComponent {
  //#region SERVICIOS
  private userService = inject(UserService);
  private roleService = inject(RoleService)
  private plotService = inject(PlotService)
  private ownerPlotService = inject(OwnerPlotService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  //#endregion

  //#region ATT
  id: string | null = null;
  user : any = {};
  address!: Address;
  addresses: Address[] = [];
  addressIndex:number | undefined = undefined;
  contact!: Contact;
  contacts: Contact[] = [];
  contactIndex:number | undefined = undefined;
  rol!: Role;
  plot! : Plot;
  roles: any[] = []
  rolesForCombo : Role[] = []
  provinceOptions!: any;
  countryOptions!: any;
  actualPlotOfOwner!: Plot[]
  minDate :any
  //#endregion

  //#region FORMULARIO REACTIVO
  userForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(50)],
    }),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado
    userName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado

    rolesForm: new FormGroup({
      rol: new FormControl('', []),
    }),

    contactsForm: new FormGroup({
      contactType: new FormControl('', []),
      contactValue: new FormControl('', []),
    }),
    addressForm: new FormGroup({
      streetAddress: new FormControl('', [Validators.required]),
      number: new FormControl(0, [Validators.required, Validators.min(0)]),
      floor: new FormControl(0),
      apartment: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      province: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [Validators.required]),
    }),

    plotForm: new FormGroup({
      plotAssign: new FormControl('', [Validators.required])
    }),
  });
  //#endregion

  //#region ON SUBMIT
  onSubmit(): void {
    // TODO: Cambiar a valid :)
    if (true) {
      if (this.id === null) {
        this.createUser()
      }
      else {
        this.updateUser()
      }
    }
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id !== null) {
      this.setEditValues();
    } else {
      this.userForm.controls['email'].setAsyncValidators(emailValidator(this.userService))
    }
    this.setEnums()
    this.getAllRoles()
    this.getPlotsOfOwner();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 7);
    this.minDate = tomorrow.toISOString().split('T')[0];
  }

  setEnums(){
    this.provinceOptions = Object.entries(Provinces).map(([key, value]) => ({
      value: key,
      display: value
    }));
    this.countryOptions = Object.entries(Country).map(([key, value]) => ({
      value: key,
      display: value
    }));
  }

  //#endregion

  //#region SETEAR VALORES AL FORM
  setEditValues() {
    if (this.id) {
      this.userService.getUserById(Number(this.id)).subscribe(
        response => {
          console.log(response)
          this.user = response;

          this.userForm.patchValue({
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            userName: this.user.userName,
          });

          if (this.user.plotId) {
            this.setPlotValue(this.user.plotId)
          }

          if (this.user.addresses) {
            this.addresses = [...this.user.addresses];
            if (this.addresses.length > 0) {
              this.setAddressValue(0);
            }
          }

          if (this.user.contacts) {
            this.contacts = [...this.user.contacts];
            if (this.contacts.length > 0) {
              this.setContactValue(0);
            }
          }

          if (this.user.roles) {
            this.roles = [...this.user.roles];
            this.userForm.get('rolesForm.rol')?.setValue(this.roles[0]?.id || null);
          }
        },
        error => {
          this.toastService.sendError('Error al obtener el usuario.')
        }
      );
    }
  }
  //#endregion

  //#region RUTEO | CANCELAR
  cancel() {
    this.router.navigate(["/user/list"])
  }
  //#endregion

  //#region FUNCION CONTACTO
  setContactValue(index: number) {
    const contact = this.contacts[index];
    console.log(contact)
    if (contact) {
      const contactFormGroup = this.userForm.get('contactsForm') as FormGroup;

      contactFormGroup.patchValue({
        contactType: contact.contactType,
        contactValue: contact.contactValue,
      })

      this.contactIndex = index;
    }
  }

  getContactsValues(): Contact {
    const contactFormGroup = this.userForm.get('contactsForm') as FormGroup;
    return {
      contactType: contactFormGroup.get('contactType')?.value || '',
      contactValue: contactFormGroup.get('contactValue')?.value || '',
    };
  }

  addContact(): void {
    if (this.userForm.get('contactsForm')?.valid) {
      const contactValues = this.getContactsValues();
      if (this.contactIndex == undefined && contactValues) {
        this.contacts.push(contactValues);
      } else if (contactValues && this.contactIndex !== undefined) {
        this.contacts[this.contactIndex] = contactValues;
        this.contactIndex = undefined;
      }
      this.userForm.get('contactsForm')?.reset();
    } else {
      this.toastService.sendError("Contacto no valido.")
    }
  }

  cancelEditContact() {
    this.userForm.get('contactsForm')?.reset();
    this.contactIndex = undefined;
  }

  removeContact(index: number): void {
    this.contacts.splice(index, 1);
  }
  //#endregion

  //#region FUNCION ROLES
  getRolValue() {
    const rolFormGroup = this.userForm.get('rolesForm') as FormGroup;
    return {
      rol: rolFormGroup.get('rol')?.value || '',
    };
  }

  addRol(): void {
    console.log(this.userForm.get('plotForm'))
    if (this.userForm.get('rolesForm')?.valid) {
      const rolValue = this.getRolValue()

      rolValue && this.roles.push(rolValue.rol);
      this.userForm.get('rolesForm')?.reset();
    } else {
      this.toastService.sendError("Rol no valido.")
    }
  }

  removeRol(index: number): void {
    this.roles.splice(index, 1);
  }

  getAllRoles() {
    this.roleService.getAllRoles(0, 1000000, true).subscribe(
      response => this.rolesForCombo = response.content
    )
  }

  transformRoles(user: User): number[] | undefined {
    return user.roles?.map(role => role.id);
  }


  //#endregion

  //#region CREATE / UPDATE
  fillUser() {
    this.user.id = this.id ? parseInt(this.id) : undefined;
    (this.user.firstName = this.userForm.get('firstName')?.value || ''),
      (this.user.lastName = this.userForm.get('lastName')?.value || ''),
      (this.user.userName = this.userForm.get('userName')?.value || ''),
      (this.user.email = this.userForm.get('email')?.value || ''),
      (this.user.isActive = this.userForm.get('isActive')?.value || undefined),
      (this.user.contacts = [...this.contacts]),
      (this.user.addresses = [...this.addresses]);
    (this.user.roles = [...this.roles]),
      (this.user.plotId = this.userForm.get('plotForm.plotAssign')?.value || undefined)
  }

  createUser() {
    this.fillUser();
    this.user.isActive = true;
    this.user = toSnakeCase(this.user);
    this.user.roles = this.transformRoles(this.user)
    this.userService.addUser(this.user, 1).subscribe({
      // '1' is x-user-id
      next: (response) => {
        this.toastService.sendSuccess("Usuario creado con exito.")
        this.router.navigate(['/user/list']);
      },
      error: (error) => {
        console.error('Error creating owner:', error);
      },
    });
  }

  updateUser() {
    this.fillUser();
    if (this.user.id) {
      this.userService.updateUser(this.user.id, this.user, 1).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Usuario actualizado con exito.")
          this.router.navigate(['/owner/list']);
        },
        error: (error) => {
          this.toastService.sendError("Error actualizado el usuario.")
        },
      });
    } else {
      this.toastService.sendError("Algo salio mal.")
    }
  }
  //#endregion

  //#region FUNCION PLOTS

  getPlotsOfOwner() {
    // TODO: Ver como obtener el ownerId
    // this.ownerPlotService.giveAllPlotsByOwner(1, 0, 100000).subscribe(
    //   response => {
    //     this.actualPlotOfOwner = response.content;
    //   },
    //   error => {
    //     this.toastService.sendError("Error recuperando sus lotes. Reinicie la pagina.")
    //   }
    // )
  }

  setPlotValue(plotId:number) {
    const plotFormGroup = this.userForm.get('plotForm') as FormGroup;
    this.plotService.getPlotById(plotId).subscribe(
      response => {
        console.log(response);
        plotFormGroup.patchValue({
          plotAssign: response.id
        })
      })
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
    const postalCodeValue = this.userForm.get('addressForm.postalCode')?.value;
    const address: Address = {
      streetAddress:
        this.userForm.get('addressForm.streetAddress')?.value || '',
      number: this.userForm.get('addressForm.number')?.value || 0,
      floor: this.userForm.get('addressForm.floor')?.value || 0,
      apartment: this.userForm.get('addressForm.apartment')?.value || '',
      city: this.userForm.get('addressForm.city')?.value || '',
      province: this.userForm.get('addressForm.province')?.value || '',
      country: this.userForm.get('addressForm.country')?.value || '',
      postalCode: postalCodeValue ? parseInt(postalCodeValue, 10) : 0
    };
    return address;
  }

  setAddressValue(index: number) {
    const address = this.addresses[index];

    if (address) {
      const addressFormGroup = this.userForm.get('addressForm') as FormGroup;

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
    if (this.userForm.get('addressForm')?.valid) {
      const addressValue = this.getAddressValue()
      if (this.addressIndex == undefined && addressValue) {
        this.addresses.push(addressValue);
      } else if (addressValue && this.addressIndex !== undefined) {
        this.addresses[this.addressIndex] = addressValue;
        this.addressIndex = undefined;
      }
      this.userForm.get('addressForm')?.reset();
    } else {
      this.toastService.sendError("Direccion no valida.")
    }
  }

  cancelEditionAddress() {
    this.addressIndex = undefined;
    this.userForm.get('addressForm')?.reset();
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

    modalRef.componentInstance.title = 'Registrar usuario inquilino';
    modalRef.componentInstance.description = 'En esta pantalla permite crear un usuario para un inquilino.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos del Usuario', 
        content: [
          {
            strong: 'Email:',
            detail: 'Campo para ingresar el correo electrónico del usuario.'
          },
          {
            strong: 'Nombre:',
            detail: 'Campo para ingresar el nombre del usuario.'
          },
          {
            strong: 'Nombre de usuario:',
            detail: 'Campo para ingresar el nombre de usuario.'
          },
          {
            strong: 'Apellido:',
            detail: 'Campo para ingresar el apellido del usuario.'
          }
        ]
      },
      { 
        title: 'Añadir Roles', 
        content: [
          {
            strong: 'Roles:',
            detail: 'Menú desplegable para seleccionar el rol del usuario.'
          },
          {
            strong: 'Agregar Rol:',
            detail: 'Botón con símbolo de "+" para agregar el rol seleccionado.'
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
          },
          {
            strong: 'Añadir Dirección:',
            detail: 'Botón para agregar la dirección ingresada.'
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
    modalRef.componentInstance.notes = [
      'Campos obligatorios: Email, Nombre, Nombre de usuario, Apellido.'
    ];
    
  }
}
