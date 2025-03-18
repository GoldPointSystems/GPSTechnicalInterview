import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ApplicationStatus, LoanApplication } from '../../../../Controllers/Models/LoanApplication.model';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {

  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];

  // VERY IMPORTANT. Pass in the API service as a parameter.
  constructor(private formBuilder: FormBuilder, private apiService: ApiService) {

    // Use Validators.required for the fields that are required.
    this.applicationForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null],
      email: [null],
      applicationNumber: [null],
      status: ['New'],
      amount: [null, Validators.required],
      monthlyPayAmount: [null],
      terms: [null, Validators.required],
      DateApplied: Date.now(),
    });
  }

  // The functionality of clicking 'save' at the bottom of the page. 
  onSubmit() {
    // Make sure that the form is valid
    if (this.applicationForm.valid) {
      const formValues = this.applicationForm.value;

      // Transform flat form values to match LoanApplication model
      // I need this because I'm mapping from C# to TS
      const applicationData = this.mapToLoanApplication(formValues);

      // Default value for the application number. This could be wrong but based on the Figma I think this is the functionality
      if (applicationData.applicationNumber === null) {
        applicationData.applicationNumber = '000000-0000'
      }

      // Right now I am using the api to store CRUD methods. Once I have the full functionality I will move those.
      this.apiService.createApplication(applicationData).subscribe({
        next: (response) => {
          // console.log("Application created successfully:", response);
          console.log("Application data: ", applicationData);
          this.applicationForm.reset(); // Reset the form so another can be filled. Though maybe I should just navigate to the applications
        },
        error: (error) => {
          console.error("Error creating application:", error);
        },
      });
    } else {
      console.error("Form was invalid");
    }
  }

  // Mapping from the form to the model class I created
  mapToLoanApplication(formValues: any): LoanApplication {
    const val: LoanApplication = {
      applicationNumber: formValues.applicationNumber,
      loanTerms: {
        amount: formValues.amount,
        monthlyPaymentAmount: formValues.monthlyPayAmount,
        terms: formValues.terms,
      },
      personalInformation: {
        name: {
          first: formValues.firstName,
          last: formValues.lastName
        },
        phoneNumber: formValues.phoneNumber,
        email: formValues.email
      },
      dateApplied: new Date(),
      status: formValues.status as ApplicationStatus
    };

    return val;
  }
}
