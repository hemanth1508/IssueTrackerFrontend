import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AppService } from '../app.service';
import { SocketService } from '../socket.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { faBars, faBell, faHome, faClipboardList, faPowerOff, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {


  currentUrl: string;
  notifications: any[];
  count: number = null;
  userId: any;
  noNotify: boolean = false;

  //font-awesome
  faBars = faBars;
  faBell = faBell;
  faClipboardList = faClipboardList;
  faHome = faHome;
  faPowerOff = faPowerOff;
  faUserCircle = faUserCircle;

  constructor(public SocketService: SocketService,
    public toastr: ToastrService,
    public router: Router,
    public _route: ActivatedRoute,
    public appService: AppService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url
      }
    })
  }

  ngOnInit() {
    this.userId = Cookie.get('userId');
    //get notifications
    this.getNotify();
  }

  // logout Function
  public logout: any = () => {
    // this.userId = this.appService.getUserInfoFromLocalstorage().userId
    this.appService.logout(this.userId)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.SocketService.exitSocket()
          Cookie.delete('authtoken');
          this.router.navigate(['/sign-in']);
        } else {
          this.toastr.info(apiResponse.message);
          Cookie.delete('authtoken');
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        } // end condition
      }, (err) => {
        this.toastr.error(`some error occured`, err);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  } // end logout

  //code to get last 10 notification
  getNotification(id) {
    this.notifications = [];
    this.noNotify = false;
    this.appService.getUserNotification(id).subscribe(
      data => {
        console.log(data);
        if (data["status"] === 200) {
          let response = data['data']
          this.notifications = []
          if (response != null) {
            response.map(x => {
              this.notifications.unshift(x);
            });
          }
          console.log(this.notifications[0].message);
        } else if (data["status"] === 404) {
          this.noNotify = true;
          //this.toastr.error(data["message"]);
        } else {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        }
      }, (err) => {
        this.toastr.error("some error occured");
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  }

  // get notifications of the user
  public getNotify: any = () => {
    // this.userId = this.appService.getUserInfoFromLocalstorage().userId
    this.SocketService.notify(this.userId)
      .subscribe((data) => {
        // this.noNotify = false;
        let message = data;

        console.log(message);
        this.notifications.unshift(message)
        this.count++;
      }, (err) => {
        //this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });//end subscribe
  }// end get message from a user 

  /**
   * clearNotify
   */
  public clearNotify() {
    // this.userId = Cookie.get('userId');
    this.count = null;
    this.getNotification(this.userId)
  }

}
