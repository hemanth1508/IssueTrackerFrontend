import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-err500',
  templateUrl: './err500.component.html',
  styleUrls: ['./err500.component.scss']
})
export class Err500Component implements OnInit {

  constructor(public router: Router, public _route: ActivatedRoute) { }

  ngOnInit(): void {
    setTimeout(() => {
      //Cookie.delete('authtoken');
      this.router.navigate(['/']);
    }, 5000);
  }

}
