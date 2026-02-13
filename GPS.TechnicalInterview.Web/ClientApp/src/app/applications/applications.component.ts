import { Component, OnInit } from '@angular/core';
import { LoanApplication } from '../models/loan-application.model';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoanApplicationStatus } from '../models/loan-application-status';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  public displayedColumns: string[] = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions'];
  public applications: LoanApplication[] = [];

  public LoanApplicationStatus = LoanApplicationStatus; // Expose enum to template for status display

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
    this.apiService.getApplications().subscribe({
      next: (data: LoanApplication[]) => {
        this.applications = data;
      },
      error: (error: unknown) => {
        console.error('Error fetching applications:', error);
        this.snackBar.open('Failed to load applications. Please try again later.', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusName(status: LoanApplicationStatus): string {
    return LoanApplicationStatus[status] ?? 'Unknown';
  }

  editApplication(application: LoanApplication): void {
    this.router.navigate([`/edit-application/${application.applicationNumber}`]);
  }

  deleteApplication(application: LoanApplication): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Delete Application",
        message: `Are you sure you want to delete application #${application.applicationNumber}?`
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.apiService.deleteApplication(application.applicationNumber).subscribe({
          next: (response: any) => {
            this.snackBar.open(response?.message || 'Application deleted successfully.', 'Close', { duration: 3000 });
            this.loadApplications();
          },
          error: (error: any) => {
            console.error('Error deleting application:', error);
            this.snackBar.open(error?.message || 'Failed to delete application. Please try again later.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
