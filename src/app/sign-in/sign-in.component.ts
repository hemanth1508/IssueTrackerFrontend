import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/socket.service';
import { faSignInAlt, faUserPlus, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {

  signupForm: boolean = false;
  statusBar: HTMLElement;
  public email: string;
  public password: string;
  firstName: any;
  lastName: any;
  forgot: boolean = false;

  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;
  faLock = faLock;
  faEnvelope = faEnvelope;

  constructor(
    private authService: AuthService,
    private appService: AppService,
    public router: Router,
    public socket: SocketService,
    private toastr: ToastrService) {
    this.statusBar = document.getElementById('zap');

  }

  ngOnInit(): void {
    this.statusBar.style.display = 'none';
    this.isLogged();
  }

  ngOnDestroy(): void {
    this.statusBar.style.display = 'block';
  }

  public isLogged = () => {
    if (this.appService.getUserInfoFromLocalstorage() && Cookie.get('authtoken') === this.appService.getUserInfoFromLocalstorage().authToken) {
      this.router.navigate(['/home']);
    } else {
      Cookie.deleteAll();
      this.appService.deleteUserInfoInLocalStorage();
    }
  }//end isLogged  

  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform == "facebook") {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    }
    else if (socialPlatform == "google") {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.authService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log(userData);
        if (userData.email && userData.name) {
          this.email = userData.email
          this.firstName = userData.name.split(' ')[0]
          this.lastName = userData.name.split(' ')[1]
          let data = {
            firstName: this.firstName.toLowerCase(),
            lastName: this.lastName.toLowerCase(),
            type: userData.provider,
            email: this.email,
          }

          this.appService.socialSignupFunction(data)
            .subscribe((apiResponse) => {
              if (apiResponse.status === 200) {
                Cookie.set('authtoken', apiResponse.data.authToken);
                Cookie.set('userId', apiResponse.data.userDetails.userId);
                Cookie.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

                this.appService.setUserInfoInLocalStorage(apiResponse.data)
                setTimeout(() => {
                  this.router.navigate(['/home']);
                }, 500);
              } else {
                this.toastr.info(apiResponse.message)
              }
            }, (err) => {
              this.toastr.error(`some error occured. Please try again later`, "Error")
            });
        }
      }
    );

  }

  // On submit function
  signup() {

    if (!this.firstName) {
      this.toastr.warning("enter first name");
    } else if (!this.lastName) {
      this.toastr.warning("enter last name");
    } else if (!this.email) {
      this.toastr.warning("enter email");
    } else if (this.password.length < 8) {
      this.toastr.warning("Please make sure your password is more than 8 random characters");
    } else {
      // this.progress = true;

      let data = {
        firstName: this.firstName.toLowerCase(),
        lastName: this.lastName.toLowerCase(),
        type: 'email',
        email: this.email.toLowerCase(),
        password: this.password,
      }
      this.appService.signupFunction(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            //let card = document.getElementById('card');
            //card.classList.add('anime')
            Cookie.set('authtoken', apiResponse.data.authToken);
            Cookie.set('userId', apiResponse.data.userDetails.userId);
            Cookie.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

            this.appService.setUserInfoInLocalStorage(apiResponse.data)
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 500);
          } else {
            this.toastr.info(apiResponse.message);
          }
        }, (err) => {
          this.toastr.error("some error occured. Please try again later")
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        });
    } // end condition
  }

  // Signin function
  signIn() {
    // this.progress = true;
    // check for email
    if (this.email) {
      // check for password 
      if (this.password.length >= 8) {
        let data = {
          email: this.email.toLowerCase(),
          password: this.password
        }
        this.appService.signinFunction(data)
          .subscribe((apiResponse) => {
            if (apiResponse.status === 200) {
              //let card = document.getElementById('card');
              //card.classList.add('anime')
              Cookie.set('authtoken', apiResponse.data.authToken);
              Cookie.set('userId', apiResponse.data.userDetails.userId);
              Cookie.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

              this.appService.setUserInfoInLocalStorage(apiResponse.data);
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 500);
            } else if (apiResponse.status === 404) {
              //this.progress = false;
              this.toastr.error("Email or Password are wrong");
            } else {
              this.toastr.error(apiResponse.message);
            }
          }, (err) => {
            this.toastr.error("some error occured");
            setTimeout(() => {
              this.router.navigate(['/500'])
            }, 500);
          });
      } else {
        this.toastr.warning("Make sure your password is more than 8 random characters");

      }// check for password ends here
    } else {
      this.toastr.warning("Please enter a valid Email and Password");
    } // check for email ends here
  }

  public goBackToLogin: any = () => {
    this.signupForm = false;
    this.forgot = false;
  }

  public goToSignup: any = () => {
    this.signupForm = true;
    this.forgot = false;
  }

  public submit: any = () => {

    if (!this.email) {
      this.toastr.warning("Please enter email");
    } else {
      let data = {
        email: this.email
      }
      this.appService.forgotPasswordFunction(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success(apiResponse.message);
            setTimeout(() => {
              // this.router.navigate(['/sign-in']);
              this.goBackToLogin();
            }, 2000);
          } else {
            this.toastr.error(apiResponse.message);
          }
        }, (err) => {
          this.toastr.error("some error occured. check your internet connection.");
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        });
    }
  }
}
