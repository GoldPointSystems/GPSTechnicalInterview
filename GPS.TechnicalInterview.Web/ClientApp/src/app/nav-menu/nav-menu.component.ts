import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  private dataService = inject(DataService);

  public headerTitle: string = '';
  public currentRoute: string = '';

  constructor(private router: Router) {}
  ngOnInit(): void {

    this.currentRoute = this.router.url;
    if (this.currentRoute === '/create-application') {
      this.headerTitle = 'Create Application';
    } else if (this.currentRoute === '/edit-applications') {
      let an = this.dataService.getApplicationNumber();
      this.headerTitle = `Aplication ${an}`;
    } else {
      this.headerTitle = 'Application Manager';
    }
  }
}
