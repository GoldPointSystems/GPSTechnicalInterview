import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { ApplicationStatus } from '../../models/application-status.enum';


@Component({
    selector: 'app-applications',
    templateUrl: './applications.component.html',
    styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
    public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', "actions"];
    public applications: any[] = [];

    constructor(private apiService: ApiService, private router: Router) { }

    ngOnInit(): void {
        this.loadApplications();
    }

    loadApplications(): void {
        this.apiService.getApplications().subscribe(
            (data) => {
                this.applications = data.map((application: any) => ({
                    ...application,
                    status: ApplicationStatus[application.status] // Map status to string value
                }));            },
            (error) => {
                console.error('Error fetching applications', error);
            }
        );
    }

    onEdit(row: any): void {
        this.router.navigate(['/update-application', row.applicationNumber]);
    }

    onDelete(row: any): void {
        if (confirm('Are you sure you want to delete this application?')) {
            this.apiService.deleteApplication(row.applicationNumber).subscribe(
                (response) => {
                    console.log('Application deleted successfully', response);
                    this.loadApplications(); // Refresh the list after deletion
                },
                (error) => {
                    console.error('Error deleting application', error);
                }
            );
        }
    }

    //onDelete(): void {
    //    const applicationId = this.applicationForm.get('applicationNumber')?.value;
    //    if (applicationId) {
    //        this.apiService.deleteApplication(applicationId).subscribe(
    //            (response) => {
    //                console.log('Application deleted successfully', response);
    //                this.router.navigate(['/applications']);
    //            },
    //            (error) => {
    //                console.error('Error deleting application', error);
    //            }
    //        );
    //    }
    //}
}
