import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { SidebarComponent } from './issue/sidebar/sidebar.component';


import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { SocketService } from './socket.service';


import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { SignInComponent } from './user/sign-in/sign-in.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { IssueModule } from './issue/issue.module';
import { SidebarComponent } from './sidebar/sidebar.component';


let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("857774433409-vpqsl97fdfa1e4itpsoc4a918ffn53n5.apps.googleusercontent.com")
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("1910426982421859")
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    SignInComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserModule,
    IssueModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    SocialLoginModule,
    FontAwesomeModule,
    RichTextEditorAllModule
  ],
  exports: [],
  providers: [
    AppService,
    SocketService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
