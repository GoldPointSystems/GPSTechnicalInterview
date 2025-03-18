// I am just coping over from the create-application component. This may not be the best way but I am running out of time.
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ApplicationStatus, LoanApplication } from '../../../../Controllers/Models/LoanApplication.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent {

  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];

  // VERY IMPORTANT. Pass in the API service as a parameter.
  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router) {
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

  ngOnInit() {
    // One of these has to work...right?
    // const navigationState = this.router.getCurrentNavigation()?.extras.state;
    const historyState = window.history.state;

    // console.log("Router Navigation State:", navigationState);
    // console.log("Window History State:", historyState);

    const application: LoanApplication =  historyState?.application;

    console.log("application: ", application);
    // Once the application is found then fill in the form so that it displays the pulled up form
    if (application) {
      this.applicationForm.patchValue({
        firstName: application.personalInformation.name.first,
        lastName: application.personalInformation.name.last,
        phoneNumber: application.personalInformation.phoneNumber,
        email: application.personalInformation.email,
        applicationNumber: application.applicationNumber,
        status: application.status,
        amount: application.loanTerms.amount,
        monthlyPayAmount: application.loanTerms.monthlyPaymentAmount,
        terms: application.loanTerms.terms,
      });
    }
  }

  // Behavior for clicking 'save' when editing a form
  onSubmit(){
    if (this.applicationForm.valid){
      console.log("Updated Application: ", this.applicationForm.value);
      this.navigateBack();
      const application: LoanApplication = this.mapToLoanApplication(this.applicationForm.value);
      this.apiService.updateApplication(application.applicationNumber, application);
    }
    else{
      console.log("This form is invalid");
    }
  }

  // navigate to the applications
  navigateBack(){
    this.router.navigate(['']);
  }

  // Again, I need to map the values to an object
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
