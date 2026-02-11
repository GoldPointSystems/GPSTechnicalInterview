import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../api.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LoanApplication } from '../models/loan-application';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions'];
  public applications: LoanApplication[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.apiService.getApplications().subscribe(data => {
      this.applications = data;
    });
  }

  editApplication(applicationNumber: string): void {
    this.router.navigate(['/edit-application', applicationNumber]);
  }

  deleteApplication(applicationNumber: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Application',
        message: `Are you sure you want to delete application ${applicationNumber}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.apiService.deleteApplication(applicationNumber).subscribe({
          next: () => {
            this.snackBar.open('Deleted successfully.', 'ok', { duration: 6000 });
            this.loadApplications();
          },
          error: () => {
            this.snackBar.open('Error deleting application.', 'ok', { duration: 6000 });
          }
        });
      }
    });
  }
}
