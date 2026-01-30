import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService, Application } from '../api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';

interface DisplayApplication {
  applicationNumber: string;
  amount: number;
  dateApplied: Date;
  status: string;
}

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})


export class ApplicationsComponent implements OnInit {

  applications: DisplayApplication[] = [];
  dataSource = new MatTableDataSource<DisplayApplication>(this.applications);
  searchText: string = '';
  selectedRow: Application | null = null;

  displayedColumns: string[] = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions'];

  statusLabels: { [key: number]: string } = {
    0: 'New',
    1: 'Approved',
    2: 'Funded'
  };

  constructor(private apiService: ApiService
    , private router: Router
    , private snackBar: MatSnackBar
    , private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.apiService.getApplications().subscribe((apps: Application[]) => {
      console.log(apps);
      this.applications = apps.map(app => ({
        applicationNumber: app.applicationNumber,
        amount: app.loanTerms.amount,
        dateApplied: new Date(app.dateApplied),
        status: this.statusLabels[app.status]
      }));

      this.dataSource = new MatTableDataSource(this.applications);

      this.dataSource.filterPredicate = (data, filter) => {
        const search = filter.trim().toLowerCase();

        return (
          data.applicationNumber.toLowerCase().includes(search) ||
          data.status.toLowerCase().includes(search) ||
          data.amount.toString().includes(search) ||
          data.dateApplied.toDateString().toLowerCase().includes(search)
        );
      };
    });
  }

  editApplication(app: Application) {
    if (!app) return;
    this.router.navigate(['/applications/edit', app.applicationNumber]);
  }

  applyFilter() {
    if (this.dataSource) {
      this.dataSource.filter = this.searchText.trim().toLowerCase();
    }
  }

  deleteApplication(app: Application) {
    if (!app) return;

    const dialogData: ConfirmDialogData = {
      title: 'Delete Application',
      message: `Are you sure you want to delete application ${app.applicationNumber}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.deleteApplication(app.applicationNumber).subscribe({
          next: () => {
            this.applications = this.applications.filter(a => a.applicationNumber !== app.applicationNumber);
            this.dataSource.data = this.applications;
            this.snackBar.open('Application deleted successfully!', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
          },
          error: () => {
            this.snackBar.open('Error deleting application', 'Close', {
              duration: 4000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }


}