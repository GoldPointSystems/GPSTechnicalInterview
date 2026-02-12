import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { ApiService } from '../api.service';
import { LoanApplicationDto } from '../models/LoanApplicationDto';
import { finalize } from 'rxjs';
import { ApplicationStatusEnum } from '../models/ApplicationStatusEnum';

@Component({
    selector: 'app-applications',
    templateUrl: './applications.component.html',
    styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent {

    public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions'];

    tableData: LoanApplicationDto[] = [];
    isLoading = false;
    isDeleting = false;
    ApplicationStatusEnum = ApplicationStatusEnum;

    constructor(private router: Router,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private apiService: ApiService) { }

    ngOnInit() {
        this.loadTableData();
    }

    loadTableData() {
        this.apiService.getAllApplications()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (data: LoanApplicationDto[]) => {
                    this.tableData = data;
                },
                error: (err) => {
                    console.error('Error fetching applications:', err);
                    this.snackBar.open('Failed to load applications', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
    }

    editApplication(applicationNumber: number) {
        this.router.navigate(['/edit-application', applicationNumber]);
    }

    deleteApplication(row: any) {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            width: '700px',
            height: '200px'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.performDelete(row);
            }
        });
    }

    performDelete(row: any) {
        if (!row || !row.applicationNumber == null) {
            return;
        }
        this.isDeleting = true;
        this.apiService.deleteApplication(row.applicationNumber)
            .pipe(finalize(() => this.isDeleting = false))
            .subscribe({
                next: () => {
                    this.loadTableData();
                    this.snackBar.open('Application deleted', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                },
                error: (err) => {
                    console.error('Error deleting application:', err);
                    this.snackBar.open('Failed to delete application', 'Close', { duration: 3000 });
                }
            });
    }
}
