import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router'; 
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit{

  public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions']; 
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];

    applications: any[] = [];

    constructor(private applicationService: ApiService,
        private router: Router,
        private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.getApplications();
    }

    getApplications(): void {
        this.applicationService.getApplications().subscribe({
            next: (data) => {
                this.applications = data.map(app => ({
                    applicationNumber: app.ApplicationNumber, 
                    amount: app.LoanTerms.Amount,
                    dateApplied: app.DateApplied,
                    status: app.Status
                }));
            },
            error: (err) => {
                console.error('Failed to load applications', err);
            }
        });
    }

    delete(appNumber: Number): void {
        if (window.confirm("Are you sure you want to delete application number " + appNumber + "?")) {
        this.applicationService.deleteApplication(appNumber).subscribe({
            next: (response) => {

                this.snackBar.open('Application deleted successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });

                this.getApplications();
            },
            error: (err) => {
                console.error('API error:', err);
            }
        })
        }
    }

    edit(appNumber: Number): void {
        this.router.navigate(['/edit-application', appNumber]);
    }
}
