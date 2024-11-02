import { Component, inject } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlotService } from '../../../../../services/plot.service';
import { RoleService } from '../../../../../services/role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'ngx-dabd-grupo01';
import { Address, Contact } from '../../../../../models/owner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService)
  private plotService = inject(PlotService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private toastService = inject(ToastService)

  id: string | null = null;
  user: any = {};
  contact!: Contact;
  contacts: Contact[] = [];
  contactIndex: number | undefined = undefined;
  provinceOptions!: any;
  countryOptions!: any;
  address!: Address;
  addresses: Address[] = [];
  addressIndex: number | undefined = undefined;

  userForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(50)],
    }),
    userName: new FormControl('', [Validators.required, Validators.maxLength(50)]),

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
  });

  setEditValues() {
    if (this.id) {
      this.userService.getUserById(Number(this.id)).subscribe(
        response => {
          console.log(response)
          this.user = response;

          this.userForm.patchValue({
            email: this.user.email,
            userName: this.user.userName,
          });

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
        },
        error => {
          this.toastService.sendError('Error al obtener el usuario.')
        }
      );
    }
  }

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


  //#region ON SUBMIT
  onSubmit(): void {
    if (this.userForm.valid) {
      this.updateUser()
    }
  }
  //#endregion

  //#region CREATE / UPDATE
  fillUser() {
    this.user.id = this.id ? parseInt(this.id) : undefined;
    (this.user.userName = this.userForm.get('userName')?.value || ''),
      (this.user.email = this.userForm.get('email')?.value || ''),
      (this.user.contacts = [...this.contacts]),
      (this.user.addresses = [...this.addresses]);
  }

  updateUser() {
    this.fillUser();
    if (this.user.id) {
      this.userService.updateUser(this.user.id, this.user, 1).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Usuario actualizado con exito.")
          //todo navigate to profile
          this.router.navigate(['']);
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


  //#region RUTEO | CANCELAR
  cancel() {
    //TODO navigate to profile
    this.router.navigate([""])
  }
  //#endregion

}
