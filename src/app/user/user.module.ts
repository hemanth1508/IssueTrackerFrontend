import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [ForgotPasswordComponent, ChangePasswordComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({ preventDuplicates: true, timeOut: 4000 }),
    RouterModule.forChild([
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'change-password/:userId', component: ChangePasswordComponent }
    ])
  ]
})
export class UserModule { }
