import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { faKey, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  userInfo: any;
  public userId: any;
  public pass1: any;
  public pass2: any;

  faKey = faKey;
  faSignInAlt = faSignInAlt;

  constructor(private appService: AppService,
    public router: Router,
    private _route: ActivatedRoute,
    public toastr: ToastrService) { }

  ngOnInit(): void {
    this.userInfo = this.appService.getUserInfoFromLocalstorage().userDetails;
    this.userId = this.userInfo.userId;
  }

  public validation: any = () => {
    if (this.pass1 === this.pass2) {
      if (this.pass1 && this.pass1.length >= 8) {
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
      let data = {
        userId: this.userId,
        password: this.pass1
      }
      this.appService.changePasswordFunction(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success('password updated successfully');
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          } else {
            this.toastr.error('error occured while updating password');
            console.log(apiResponse.message)
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
