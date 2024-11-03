import { Routes } from '@angular/router';
import {HomeComponent} from "./components/common/home/home.component";
import {UserUserListComponent} from "./components/repositories/users/users/user-user-list/user-user-list.component";
import {UserUserFormComponent} from "./components/repositories/users/users/user-user-form/user-user-form.component";
import {
  UserUserDetailComponent
} from "./components/repositories/users/users/user-user-detail/user-user-detail.component";
import {
  UserUserTenantFormComponent
} from "./components/repositories/users/users/user-user-tenant-form/user-user-tenant-form.component";
import {
  CadastrePlotDetailComponent
} from "./components/repositories/cadastre/plots/cadastre-plot-detail/cadastre-plot-detail.component";
import {
  AccountAccountConceptComponent
} from "./components/repositories/account/account-account-concept/account-account-concept.component";
import {
  AccountAccountListComponent
} from "./components/repositories/account/account-account-list/account-account-list.component";
import {NotFoundComponent} from "./components/common/not-found/not-found.component";
import {
  CadastrePlotFormComponent
} from "./components/repositories/cadastre/plots/cadastre-plot-form/cadastre-plot-form.component";
import {
  CadastrePlotListComponent
} from "./components/repositories/cadastre/plots/cadastre-plot-list/cadastre-plot-list.component";
import {
  UsersRolesFormComponent
} from "./components/repositories/users/roles/users-roles-form/users-roles-form.component";
import {
  UsersRolesDetailComponent
} from "./components/repositories/users/roles/users-roles-detail/users-roles-detail.component";
import {
  UsersRolesListComponent
} from "./components/repositories/users/roles/users-roles-list/users-roles-list.component";
import {
  CadastreOwnerFormComponent
} from "./components/repositories/cadastre/owners/cadastre-owner-form/cadastre-owner-form.component";
import {
  CadastreOwnerDetailComponent
} from "./components/repositories/cadastre/owners/cadastre-owner-detail/cadastre-owner-detail.component";
import {
  CadastreOwnerListComponent
} from "./components/repositories/cadastre/owners/cadastre-owner-list/cadastre-owner-list.component";
import {FilesFormComponent} from "./components/repositories/cadastre/files/files-form/files-form.component";
import {
  OwnerFilesViewComponent
} from "./components/repositories/cadastre/files/owner-files-view/owner-files-view.component";
import {FilesViewComponent} from "./components/repositories/cadastre/files/files-view/files-view.component";
import {
  CadastreOwnerPlotListComponent
} from "./components/repositories/cadastre/owners-X-plots/cadastre-owner-plot-list/cadastre-owner-plot-list.component";
import {
  CadastrePlotOwnerListComponent
} from "./components/repositories/cadastre/owners-X-plots/cadastre-plot-owner-list/cadastre-plot-owner-list.component";
import {
  UsersCreatedByUserComponent
} from "./components/repositories/users/users/users-created-by-user/users-created-by-user.component";

export const routes: Routes = [
  //{ path: 'login', component: LoginComponent },
  //{ path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, /* canActivate: [authGuard] */ },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'owner/form', component: CadastreOwnerFormComponent, /* canActivate: [authGuard] */ },
  { path: 'owner/form/:id', component: CadastreOwnerFormComponent, /* canActivate: [authGuard] */ },
  { path: 'owner/detail/:id', component: CadastreOwnerDetailComponent, /* canActivate: [authGuard] */ },
  { path: 'owner/list', component: CadastreOwnerListComponent, /* canActivate: [authGuard] */ },
  { path: 'plot/form', component: CadastrePlotFormComponent, /* canActivate: [authGuard] */ },
  { path: 'plot/form/:id', component: CadastrePlotFormComponent, /* canActivate: [authGuard] */ },
  { path: 'plot/list', component: CadastrePlotListComponent, /* canActivate: [authGuard] */ },
  { path: 'files/form', component: FilesFormComponent, /* canActivate: [authGuard] */ },
  { path: 'files/view', component: FilesViewComponent, /* canActivate: [authGuard] */ },
  { path: 'files/:ownerId/view', component: OwnerFilesViewComponent, /* canActivate: [authGuard] */ },
  { path: 'user/list', component: UserUserListComponent, /* canActivate: [authGuard] */ },
  // { path: 'user/form', component: UserFormComponent, /* canActivate: [authGuard] */ },
  { path: 'user/form', component: UserUserFormComponent, /* canActivate: [authGuard] */ },
  { path: 'user/form/:id', component: UserUserFormComponent, /* canActivate: [authGuard] */ },
  { path: 'user/detail/:id', component: UserUserDetailComponent, /* canActivate: [authGuard] */ },
  { path: 'user/created/:id', component: UsersCreatedByUserComponent, /* canActivate: [authGuard] */ },
  { path: 'roles/list', component: UsersRolesListComponent, /* canActivate: [authGuard] */ },
  { path: 'user/tenant/form', component: UserUserTenantFormComponent, /* canActivate: [authGuard] */ },
  { path: 'user/tenant/form/:id', component: UserUserTenantFormComponent, /* canActivate: [authGuard] */ },
  // { path: 'roles/form', component: UsersRolesFormComponent, /* canActivate: [authGuard] */},
  // { path: 'roles/form/:roleId', component: UsersRolesFormComponent, /* canActivate: [authGuard] */},
  { path: 'roles/detail/:roleId', component: UsersRolesDetailComponent, /* canActivate: [authGuard] */},
  { path: 'owners/plot/:plotId', component: CadastreOwnerPlotListComponent, /* canActivate: [authGuard] */ },
  { path: 'plots/owner/:ownerId', component: CadastrePlotOwnerListComponent, /* canActivate: [authGuard] */ },
  { path: 'plot/detail/:id', component: CadastrePlotDetailComponent, /* canActivate: [authGuard] */ },
  { path: 'account/concept/:accountId', component: AccountAccountConceptComponent, /* canActivate: [authGuard] */ },
  { path: 'account/list', component: AccountAccountListComponent, /* canActivate: [authGuard] */ },
  { path: '**', component: NotFoundComponent, /* canActivate: [authGuard] */ },
]
