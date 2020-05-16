import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'IssueTracker';

  // onRightClick() {
  //   return false;
  // }

  // @HostListener('contextmenu', ['$event'])
  // onRightClick(event) {
  //   event.preventDefault();
  // }
}
