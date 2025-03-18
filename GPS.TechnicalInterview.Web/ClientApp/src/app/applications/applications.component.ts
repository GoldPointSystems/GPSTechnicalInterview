import { Component, createComponent, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../api.service';
import { ApplicationStatus, LoanApplication } from '../../../../Controllers/Models/LoanApplication.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent {

  // Added the actions column though on the Figma design the column doesn't have a name
  // Mainly it's so that I can specify the column name on the html component.
  public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions'];
  public applications: LoanApplication[] = [];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.onLoad();
  }

  onLoad() {
    this.apiService.getAllApplications().subscribe({
      // Using API service but I will have to move them to the controller.
      next: (response) => {
        console.log("This method worked!", response);

        // Have a local array which can hold the array that the API service gets.
        // This way I can also just reference the applications array in the html.
        this.applications = response;

      //   this.applications.forEach((app, index) => {
      //     console.log(`Application ${index}:`, app);
      //     console.log("Loan Terms:", app.loanTerms);
      //     console.log("Personal Information:", app.PersonalInformation);
      //     console.log("Amount:", app.LoanTerms?.Amount);
      //     console.log("Name:", app.PersonalInformation?.Name);
      // });
      },
      error: (error) => {
        console.error("This method did not work...", error);
      }
    })
  }

  editApplication(application: LoanApplication): void {
    console.log("Editing application:", application);

    // Sends application data
    this.router.navigate(['/edit-application'], { state: { application } });
  }

  deleteApplication(applicationNumber: string): void {
    if (confirm("Are you sure you want to delete this application?")) {
      this.apiService.deleteApplication(applicationNumber).subscribe({
        next: () => {
          this.applications = this.applications.filter(app => app.applicationNumber !== applicationNumber);
          console.log("Application deleted successfully");
        },
        error: (error) => {
          console.error("Error deleting application:", error);
        }
      });
    }

  }
}
