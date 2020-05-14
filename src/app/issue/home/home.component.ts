import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AppService } from '../../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../socket.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faBars, faBell, faHome, faClipboardList, faPowerOff, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  public authToken: string;
  public userId: string;
  public length: number;
  public pageSize: number = 5;
  public pageSizeOptions: number[] = [5, 10, 25, 100];
  pageIndex: number = 0;
  public sort: string = "createdOn.-1";
  public searchText: string;
  public cross: boolean = false;
  public none: boolean = false;
  issues: any;
  currentIssue: any;
  pageEvent: PageEvent;
  display: boolean = false;
  userInfo: any;
  public time;

  public sortArrow1: boolean = false;
  public sortArrow2: boolean = false;
  public sortArrow3: boolean = false;
  public sortArrow4: boolean = false;
  // notifications: any[];
  // count: number = null;
  // noNotify: boolean = false;

  // socketservice varialbes
  public userList: any = [];
  public disconnectedSocket: boolean;
  noIssue: boolean;

  //font-awesome
  faPowerOff = faPowerOff;
  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;

  constructor(public socket: SocketService,
    public toastr: ToastrService,
    public router: Router,
    public _route: ActivatedRoute,
    public appService: AppService,
    private modal: NgbModal,
  ) { }

  //on init
  ngOnInit() {
    this.isLoggedOut();
    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage().userDetails;
    this.userId = Cookie.get('userId');;
    this.verifyUserConfirmation();
    this.searchText = '';
    this.cross = false;
    this.getAllIssue(this.pageSize, this.pageIndex, this.sort);

    this.getOnlineUserList();
    //get notifications
    this.getNotify();
  }
  // on destroy
  ngOnDestroy() {
    // this.socket.exitSocket()
  }



  public check = () => {
    // console.log('check is running');
    if (!this.appService.getUserInfoFromLocalstorage()) {

      Cookie.delete('authtoken');

      Cookie.delete('userId');

      Cookie.delete('userName');

      Cookie.deleteAll();

      localStorage.clear();
      this.router.navigate(['/sign-in']);
    }
  } //end check

  public isLoggedOut = () => {
    this.time = setInterval(() => {
      this.check();
    }, 3000);
  }//end IsLoggedOut

  // check to for validity
  public checkStatus: any = () => {
    if (Cookie.get('authtoken') === undefined ||
      Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) {
      this.router.navigate(['/sign-in']);
      return false;
    } else {
      return true;
    }
  } // end checkStatus
  // socket event to verifyUser
  public verifyUserConfirmation: any = () => {
    this.socket.verifyUser()
      .subscribe(() => {
        this.disconnectedSocket = false;
        this.socket.setUser(this.authToken);
      });
  }

  public logout: any = () => {
    this.appService.logout(this.userId)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.socket.exitSocket()
          Cookie.delete('authtoken');
          Cookie.delete('userId');
          Cookie.delete('userName');
          Cookie.deleteAll();
          this.appService.deleteUserInfoInLocalStorage();
          this.toastr.success(apiResponse.message);
          setTimeout(() => {
            this.router.navigate(['/sign-in']);
          }, 2000);
        } else {
          this.toastr.info(apiResponse.message);
          setTimeout(() => {
            this.router.navigate(['/'])
          }, 500);
        } // end condition
      }, (err) => {
        this.toastr.error(`some error occured`, err);
        setTimeout(() => {
          this.router.navigate(['/sign-in'])
        }, 500);
      });
  } // end logout

  // socket event to get online user list
  public getOnlineUserList: any = () => {
    this.socket.onlineUserList()
      .subscribe((userList) => {
        this.userList = [];
        for (let x in userList) {
          let temp = { 'userId': userList[x].userId, 'name': userList[x].fullName };
          this.userList.push(temp);
        }
        // console.log('UserList =>', this.userList);
      }); // end online-user-list
  }
  //page event
  public getServerData = (event?: PageEvent) => {
    this.pageEvent = event;
    this.getAllIssue(event.pageSize, event.pageIndex, this.sort)
    this.pageSize = event.pageSize
  }
  //search
  public search = (e) => {
    this.cross = true;
    this.appService.searchIssue(this.searchText).subscribe(data => {
      let response = data['data']
      this.length = data['count']
      if (data['status'] == 200) {
        this.issues = []
        this.issues = response;
      } else if (data['status'] == 404) {
        this.none = true
        this.toastr.error(data['message']);
        setTimeout(() => {
          this.none = false
        }, 5000);
      } else {
        this.toastr.error("some error occured");
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      }
    }, () => {
    });
  }
  //get all issues
  public getAllIssue = (pageSize, pageIndex, sort) => {
    this.appService.getAllIssue(pageSize, pageIndex, sort).subscribe(data => {
      let response = data['data']
      this.length = data['count']
      if (data['status'] == 200) {
        this.issues = response;
        //this.toastr.success(data['message']);
      } else if (data['status'] == 404) {
        this.noIssue = true;
        this.toastr.warning(`${data['message']}. Please add issues`);
      } else {
        this.toastr.error(data['message']);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      }
    }, (err) => {
      this.toastr.error(`error occured while connecting to server`);
      setTimeout(() => {
        this.router.navigate(['/500']);
      }, 500);
    });
  }
  // Sorting function
  public sortBy = (type: string) => {
    if (type == "title") {
      this.sortArrow1 = !this.sortArrow1;
      this.sortArrow2 = false;
      this.sortArrow3 = false;
      this.sortArrow4 = false;
      if (this.sort == "title.1") {
        this.sort = 'title.-1'
      } else {
        this.sort = 'title.1'
      }
    } else if (type == "reporter") {
      this.sortArrow2 = !this.sortArrow2;
      this.sortArrow1 = false;
      this.sortArrow3 = false;
      this.sortArrow4 = false;
      if (this.sort == "reporter.1") {
        this.sort = 'reporter.-1'
      } else {
        this.sort = 'reporter.1'
      }
    } else if (type == "status") {
      this.sortArrow3 = !this.sortArrow3;
      this.sortArrow1 = false;
      this.sortArrow2 = false;
      this.sortArrow4 = false;
      if (this.sort == "status.1") {
        this.sort = 'status.-1'
      } else {
        this.sort = 'status.1'
      }
    } else {
      this.sortArrow4 = !this.sortArrow4;
      this.sortArrow1 = false;
      this.sortArrow2 = false;
      this.sortArrow3 = false;
      if (this.sort == "createdOn.1") {
        this.sort = 'createdOn.-1'
      } else {
        this.sort = 'createdOn.1'
      }
    }
    this.getAllIssue(this.pageSize, this.pageIndex, this.sort);
  }


  // get notifications of the user
  public getNotify: any = () => {
    this.socket.notify(this.userId)
      .subscribe((data) => {
        let message = data;
        this.toastr.info(`${message.message}`);
      }, (err) => {
        this.toastr.error(`your session expired or you are not logged in notify`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });//end subscribe
  }// end get message from a user 


  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('alert') alert: TemplateRef<any>;
  modalData: {
    issue: any;
  };

  public displayDescription = (issue) => {
    //console.log(issue);
    this.modalData = { issue };
    this.modal.open(this.modalContent, { size: 'xl' });
  }

}
