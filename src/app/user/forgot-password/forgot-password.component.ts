import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  statusBar: HTMLElement;
  public email: any;

  constructor(
    private appService: AppService,
    public router: Router,
    private toastr: ToastrService
  ) {
    this.statusBar = document.getElementById('zap');
  }

  ngOnInit(): void {
    this.statusBar.style.display = 'none';
  }
  ngOnDestroy(): void {
    this.statusBar.style.display = 'block';
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  //matcher = new MyErrorStateMatcher();


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
              this.router.navigate(['/sign-in']);
            }, 2000);
          } else {
            this.toastr.error(apiResponse.message);
          }
        }, (err) => {
          this.toastr.error("some error occured");
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        });
    }
  }
}
