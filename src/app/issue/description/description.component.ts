import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SocketService } from '../../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpEventType } from '@angular/common/http';
import { Location } from '@angular/common';
import { faReply, faEye, faImage, faComment, faArchive, faPlus, faTrashAlt, faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent implements OnInit {

  public editorContent: string;
  public selectFile: File = null;
  public imageUrl: string;
  public title: string;
  public status: string;
  public warning: boolean = false;
  public assignee = new FormControl();
  public time;


  public tools: object = {
    items: [
      'Undo', 'Redo', '|', 'Bold', 'Italic', 'Underline', 'StrikeThrough', 'superscript', 'subscript', '|',
      'FontName', 'FontSize', '|',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
      'Indent', 'Outdent', '|', 'CreateLink', 'CreateTable',
      '|', 'ClearFormat', 'SourceCode', '|', 'cut', 'copy']
  };

  message: string;
  currentUrl: string;
  editMode: boolean = true;
  users = [];
  uploadStautus: boolean = false;
  progress: number;
  userId: any;
  userInfo: any;
  mySelect: any[];
  reporterId: any;
  assigneeDisabled: any[];
  anotherList: any[];
  reporter: any;
  previous: any;
  comment: string;
  commentsArray: any;
  watchee: boolean = false;
  watchers: any;
  assigneeArray = [];
  name: string;
  userList: any;
  disconnectedSocket: boolean;
  authToken: string;

  faReply = faReply;
  faEye = faEye;
  faImage = faImage;
  faComment = faComment;
  faArchive = faArchive;
  faPlus = faPlus;
  faTrashAlt = faTrashAlt;
  faDownload = faDownload;

  constructor(
    public SocketService: SocketService,
    private location: Location,
    public appService: AppService,
    public toastr: ToastrService,
    public router: Router,
    public _route: ActivatedRoute, ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url
        this.currentUrl = this.currentUrl.split('/')[2]
        if (this.currentUrl == 'add') {
          this.editMode = false;
          this.clear()
        } else if (this.currentUrl == '') {
          setTimeout(() => {
            this.router.navigate(['/'])
          }, 500);
        }
      }
    })
  }

  ngOnInit() {

    this.isLoggedOut();

    // this.checkStatus();
    this.authToken = Cookie.get('authtoken');

    this.getALLUsers();
    this.userInfo = this.appService.getUserInfoFromLocalstorage().userDetails;
    //console.log(this.userInfo)
    this.userId = this.userInfo.userId;
    this.name = `${this.userInfo.firstName} ${this.userInfo.lastName}`

    if (this.currentUrl != "add") {
      this.getIssueDetails()
    }

    // Socket intialization
    this.verifyUserConfirmation();

    this.getOnlineUserList();

    //get notifications
    this.getNotify();


  }

  ngOnDestroy() {

    // this.SocketService.exitSocket()

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

    if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) {

      this.router.navigate(['/sign-in']);

      return false;

    } else {

      return true;

    }

  } // end checkStatus


  // socket event to verifyUser
  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe(() => {
        this.disconnectedSocket = false;
        this.SocketService.setUser(this.authToken);
      });
  }

  public logout: any = () => {
    this.userId = this.appService.getUserInfoFromLocalstorage().userId
    this.appService.logout(this.userId)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.SocketService.exitSocket()
          Cookie.delete('authtoken');
          this.router.navigate(['/sign-in']);
        } else {
          this.toastr.info(apiResponse.message);
          // Cookie.delete('authtoken');
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

  // socket event to get online user list
  public getOnlineUserList: any = () => {

    this.SocketService.onlineUserList()
      .subscribe((userList) => {


        this.userList = [];

        for (let x in userList) {

          let temp = { 'userId': userList[x].userId, 'name': userList[x].fullName };

          this.userList.push(temp);

        }

        // console.log('UserList>>>>>', this.userList);

      }); // end online-user-list
  }


  onFileSelected(event) {
    this.warning = false
    this.selectFile = <File>event.target.files[0];

    if (this.selectFile) {

      let reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      }
      reader.readAsDataURL(this.selectFile);

      if (this.selectFile.size > 5000000) {
        this.warning = true

        this.message = "Please make sure your image is less than 5Mb for ensuring the performance of the app"

      }

      if (this.selectFile.type == "image/png" || this.selectFile.type == "image/jpeg") {

      } else {
        this.warning = true

        this.message = "Please make sure your image format is Jpeg/Png"

      }

    }

  }


  // Get all users
  getALLUsers() {

    this.appService.getAllUsers().subscribe(
      data => {

        let userArray = data['data'];
        setTimeout(() => {
          userArray.filter(x => {
            let userObj = {
              name: `${x.firstName} ${x.lastName}`,
              userId: x.userId
            }
            if (x.userId != this.appService.getUserInfoFromLocalstorage().userId && x.userId != this.reporterId) {
              this.users.push(userObj)
            }
          })
        }, 200);

      }, (err) => {

        this.toastr.error(`error occured while connecting to server`);

        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);

      });

  }//end of get all users.


  /**
   * save
   */
  public save() {

    if (!this.editMode) {

      if (!this.title) {
        this.toastr.warning(`Enter Title Name`);
      } else if (!this.status) {
        this.toastr.warning(`Select Status`);
      } else if (!this.editorContent) {
        this.toastr.warning(`Enter Description`);
      } else if (!this.selectFile) {
        this.toastr.warning(`Select Image`);
      } else if (!this.assignee.value || this.assignee.value.length == 0) {
        this.toastr.warning(`Add assignee`);
      } else {
        //console.log(this.assignee.value.name);
        let data = {
          title: this.title.toLowerCase(),
          status: this.status,
          description: this.editorContent,
          assignee: this.assignee.value,
          screenshot: this.selectFile,
        }

        this.appService.createIssue(data).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadStautus = true;
            this.progress = Math.round(event.loaded / event.total * 100);
          } else if (event.type === HttpEventType.Response) {
            if (event.body['status'] === 200) {
              this.toastr.success(`${event.body['message']}.`);
              setTimeout(() => {
                this.router.navigate(['/home'])
              }, 1000);
            } else if (event.body['status'] === 404) {
              this.toastr.error(`${event.body['message']}`);
            } else {
              this.toastr.error(`${event.body['message']}`);
              setTimeout(() => {
                this.router.navigate(['/500'])
              }, 500);
            }
          }
        })
      }
    } else {
      ////////////////////////////For Editing//////////////////////////
      if (!this.title) {
        this.toastr.warning(`Enter Title Name`);
      } else if (!this.status) {
        this.toastr.warning(`Select Status`);
      } else if (!this.editorContent) {
        this.toastr.warning(`Enter Description`);
      } else if (!this.assignee.value || this.assignee.value.length == 0) {
        this.toastr.warning(`Add atleast one assignee`);
      } else {
        let assigneeArray = this.assignee.value
        if (this.userId !== this.reporterId) {
          let obj = {
            name: this.name,
            userId: this.userId
          }
          assigneeArray.push(obj);
        }
        let data = {
          title: this.title.toLowerCase(),
          status: this.status,
          description: this.editorContent,
          assignee: assigneeArray,
          screenshot: this.selectFile,
          reporter: this.reporter,
          previous: this.previous,
          id: this.currentUrl
        }
        this.appService.editIssue(data).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(event.loaded / event.total * 100)
          } else if (event.type === HttpEventType.Response) {
            if (event.body['status'] === 200) {
              this.toastr.success(`${event.body['message']}.`);
              this.notify(`${this.name} has Edited ${data.title}`);
              setTimeout(() => {
                this.router.navigate(['/home'])
              }, 1000);
            } else if (event.body['status'] === 404) {
              this.toastr.error(`${event.body['message']}`);
            } else {
              this.toastr.error(`${event.body['message']}`);
              setTimeout(() => {
                this.router.navigate(['/500'])
              }, 500);
            }
          }
        })
      }
    }
  }

  //getting Issue details to pre render values
  getIssueDetails() {
    this.appService.getIssueInfo(this.currentUrl).subscribe(
      data => {
        if (data['status'] == 200) {
          let response = data['data']
          this.imageUrl = response.screenshot
          this.title = response.title
          this.status = response.status
          this.editorContent = response.description
          this.reporterId = response.reporter[0].userId
          this.reporter = response.reporter
          this.previous = response.screenshot
          this.commentsArray = response.comments
          this.watchers = response.watching
          // To check userId of assignee and give them rights to edit
          response.assignee.filter(x => this.assigneeArray.push(x.userId));
          response.watching.filter(x => {
            if (x.userId == this.userId) {
              this.watchee = true;
            }
          })
          setTimeout(() => {
            this.anotherList = [];
            response.assignee.filter(x => {
              for (let y of this.users) {
                if (y.userId == x.userId) {
                  // for Default Checking of value
                  this.anotherList.push(y);
                }
              }
            });
            this.assignee.setValue(this.anotherList);
          }, 3000);
        } else {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        }
      }, (err) => {
        this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  }


  /**
   * postComment
   */
  public postComment() {
    if (this.comment) {
      let data = {
        id: this.currentUrl,
        comment: this.comment
      }
      this.appService.postComment(data).subscribe(
        data => {
          if (data['status'] == 200) {
            this.notify(`${this.name} has Commented ${this.comment} on ${this.title}`);
            this.toastr.success(`${data['message']}`);
            this.router.navigate(['/home'])
          } else {
            this.toastr.error(`some error occured`);
            setTimeout(() => {
              this.router.navigate(['/500'])
            }, 500);
          }
        }, (err) => {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        });
    } else {
      this.toastr.info(`Comment box empty!`);
    }
  }

  /**
   * Add Assignee
   */
  public addAssignee() {
    let data = {
      assignee: this.assignee.value,
      id: this.currentUrl
    }
    this.appService.addAssignee(data).subscribe(
      data => {
        if (data['status'] == 200) {
          this.router.navigate(['/home'])
          this.notify(`${this.name} has Added Assignee on ${this.title}`);
          this.toastr.success(`${data['message']}`);
        } else {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        }
      }, (err) => {
        this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  }

  /**
   * Add as WatchIng
   */
  public addWatchee() {
    this.appService.addWatchee(this.currentUrl).subscribe(
      data => {
        if (data['status'] == 200) {
          this.watchee = true;
          this.notify(`${this.name} has Subscribed to ${this.title}`);
          this.toastr.success(`${data['message']}`);
        } else {
          this.toastr.error(`some error occured`);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        }
      }, (err) => {
        this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  }

  delete() {
    this.appService.delete(this.currentUrl, this.imageUrl).subscribe(
      data => {
        if (data['status'] == 200) {
          this.toastr.success(`${data['message']}`);
          setTimeout(() => {
            this.router.navigate(['/home'])
          }, 500);
        } else {
          this.toastr.error(data['message']);
          setTimeout(() => {
            this.router.navigate(['/500'])
          }, 500);
        }
      }, (err) => {
        this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });
  }

  /**
   * notify
   */
  public notify(message) {
    // sending notification to watchers
    //console.log(this.watchers)
    this.watchers.filter(x => {
      let notifyObj = {
        senderName: this.name,
        senderId: this.userId,
        receiverName: x.name,
        receiverId: x.userId,
        issueId: this.currentUrl,
        message: message,
      }
      this.SocketService.sendNotify(notifyObj)
    })

    //sending notification to assignee's
    //console.log(this.users)
    this.users.filter(x => {
      let notifyObj = {
        senderName: this.name,
        senderId: this.userId,
        receiverName: x.name,
        receiverId: x.userId,
        issueId: this.currentUrl,
        message: message,
      }
      this.SocketService.sendNotify(notifyObj)
    })

    //sending notifications to Reporter
    if (this.userId != this.reporterId) {
      let notifyObj = {
        senderName: this.name,
        senderId: this.userId,
        receiverName: this.reporter[0].name,
        receiverId: this.reporterId,
        issueId: this.currentUrl,
        message: message,
      }
      this.SocketService.sendNotify(notifyObj)
    }
  }

  // get notifications of the user
  public getNotify: any = () => {
    this.SocketService.notify(this.userId)
      .subscribe((data) => {
        let message = data;
        this.toastr.info(`${message.message}`);
      }, (err) => {
        this.toastr.error(`some error occured`);
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);
      });//end subscribe
  }// end get message from a user 

  clear() {
    this.title = ''
    this.status = '',
      this.editorContent = "",
      this.imageUrl = '',
      this.assignee.setValue([])
  }
  goBack() {
    this.location.back();
  }
}
