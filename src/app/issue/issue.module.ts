import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DescriptionComponent } from './description/description.component';
import { Err500Component } from './err500/err500.component';
import { RouteGuardService } from './route-guard.service';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [
    HomeComponent,
    DescriptionComponent,
    Err500Component
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({ preventDuplicates: true, timeOut: 4000 }),
    HttpClientModule,
    MatPaginatorModule,
    FontAwesomeModule,
    RichTextEditorAllModule,
    MatSelectModule,
    RouterModule.forChild([
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [RouteGuardService]
      },
      {
        path: 'description/:type',
        component: DescriptionComponent,
        canActivate: [RouteGuardService]
      },
      {
        path: '500',
        component: Err500Component
      },
      {
        path: '**',
        redirectTo: 'sign-in'
      }
    ])
  ],
  exports: [],
  providers: [RouteGuardService]
})
export class IssueModule { }
