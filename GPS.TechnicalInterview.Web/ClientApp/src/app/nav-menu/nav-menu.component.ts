import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  public headerTitle: string = '';
  public currentRoute: string = '';

  constructor(private router: Router) {}
  ngOnInit(): void {

    this.currentRoute = this.router.url;
    if (this.currentRoute === '/create-application') {
      this.headerTitle = 'Create Application';
    } 
    else if(this.currentRoute.startsWith('/applications/edit/')) {
      const appNumber = this.currentRoute.split('/').pop();
      this.headerTitle = `Application ${appNumber}`;
    }
    else {
      this.headerTitle = 'Application Manager';
    }
  }
}
