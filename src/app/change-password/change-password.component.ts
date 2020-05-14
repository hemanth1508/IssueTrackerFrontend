import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { faKey, faSignInAlt } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  statusBar: HTMLElement;

  public userId: any;
  public pass1: any;
  public pass2: any;

  faKey = faKey;
  faSignInAlt = faSignInAlt;

  constructor(
    public appService: AppService,
    public router: Router,
    private _route: ActivatedRoute,
    public toastr: ToastrService
  ) {
    this.statusBar = document.getElementById('zap');
  }


  ngOnInit() {
    this.statusBar.style.display = 'none';
  }

  ngOnDestroy() {
    this.statusBar.style.display = 'block';
  }

  public validation: any = () => {
    if (this.pass1 === this.pass2) {
      if (this.pass1 !== null && this.pass1 !== undefined && this.pass1.length >= 8) {
        return true;
      } else {
        this.toastr.warning(`Please make sure your password is more than 8 character`);
        return false
      }
    } else {
      this.toastr.warning(`Please make sure you have enter same password in both feilds`);
    }
  }

  public changePasswordFunction: any = () => {
    if (this.validation()) {
      let captureId = this._route.snapshot.paramMap.get("userId");
      let data = {
        userId: captureId,
        password: this.pass1
      }
      this.appService.changePasswordFunction(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success(apiResponse.message);
            setTimeout(() => {
              this.router.navigate(['/sign-in']);
            }, 2000);
          } else {
            this.toastr.error(apiResponse.message);
            setTimeout(() => {
              this.router.navigate(['/500']);
            }, 2000);
          }
        }, (err) => {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        });
    }
  }

}
