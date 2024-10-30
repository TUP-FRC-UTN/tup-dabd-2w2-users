import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Role} from "../../../../../models/role";
import {ActivatedRoute, Router} from "@angular/router";
import {MainContainerComponent, ToastService} from "ngx-dabd-grupo01";
import {RoleService} from "../../../../../services/role.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-users-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainContainerComponent],
  templateUrl: './users-roles-form.component.html',
  styleUrl: './users-roles-form.component.scss'
})
export class UsersRolesFormComponent {
  roleForm: FormGroup;
  role: Role | undefined;
  id: string | null = "";

  constructor(private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private toastService: ToastService,
              private roleService: RoleService){
    this.roleForm = this.formBuilder.group({
      codeControl:['', [Validators.required, Validators.maxLength(4)]],
      nameControl:['', [Validators.required, Validators.maxLength(10)]],
      prettyNameControl:['', [Validators.required ,Validators.maxLength(25)]],
      descriptionControl: ['', [Validators.maxLength(50)]],
    });
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('roleId');
    if (this.id !== null) {
      this.roleService.getRole(Number.parseInt(this.id)).subscribe({
        next: (data) => {
          this.role = data;
          this.roleForm.patchValue({
            codeControl: this.role.code,
            nameControl: this.role.name,
            prettyNameControl: this.role.prettyName,
            descriptionControl: this.role.description
          })
          this.roleForm.controls['codeControl'].disable();
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  setFieldsEnabled() {
    this.roleForm.enable();
  }

  setFieldsDisabled() {
    this.roleForm.disable();
  }

  navigateToList() {
    this.router.navigate(['roles/list']);
  }

  createRole(){
    let newRole: any = {
      code: this.roleForm.value.codeControl,
      name: this.roleForm.value.nameControl,
      pretty_name: this.roleForm.value.prettyNameControl,
      description: this.roleForm.value.descriptionControl
    }
    this.roleService.createRole(newRole as Role, 1).subscribe({
      next: () => {
        this.toastService.sendSuccess("Rol creado con exito.");
        this.navigateToList();
      },
      error: (error) => {
        console.error('Error creating plot:', error);
        this.toastService.sendError("Error creando el rol.");
      }
    });
  }

  updateRole(id: number){
    let updateRole: any = {
      code: this.role?.code,
      name: this.roleForm.value.nameControl,
      pretty_name: this.roleForm.value.prettyNameControl,
      description: this.roleForm.value.descriptionControl,
    }
    this.roleService.updateRole(id, updateRole as Role, 1).subscribe({
      next: () => {
        this.toastService.sendSuccess("Rol modificado con exito.");
        this.navigateToList();
      },
      error: (error) => {
        console.log(error);
        this.toastService.sendError("Error modificando el rol.");
      }
    });
  }

  onSubmit() {
    if (this.roleForm.valid) {
      if (this.id === null) {
        this.createRole();
      }
      else{
        this.updateRole(Number.parseInt(this.id));
      }
    }
  }


}
