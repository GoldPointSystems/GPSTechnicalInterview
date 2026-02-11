import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  public headerTitle: string = '';
  public currentRoute: string = '';
  public showBackArrow: boolean = false;
  @Output() backClick = new EventEmitter<void>();

  constructor(private router: Router) {}
  ngOnInit(): void {

    this.currentRoute = this.router.url;
    if (this.currentRoute === '/create-application') {
      this.headerTitle = 'Create Application';
      this.showBackArrow = true;
    } else if (this.currentRoute.startsWith('/edit-application/')) {
      const appNumber = this.currentRoute.replace('/edit-application/', '');
      this.headerTitle = 'Application ' + decodeURIComponent(appNumber);
      this.showBackArrow = true;
    } else {
      this.headerTitle = 'Application Manager';
      this.showBackArrow = false;
    }
  }
}
