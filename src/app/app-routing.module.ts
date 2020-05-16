import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'change-password/:userId', component: ChangePasswordComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
