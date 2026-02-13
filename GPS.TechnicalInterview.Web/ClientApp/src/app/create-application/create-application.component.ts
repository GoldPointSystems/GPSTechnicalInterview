import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { LoanApplication } from '../models/loan-application.model';
import { LoanApplicationStatus } from '../models/loan-application-status';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {

  public applicationForm: FormGroup;
  public statuses = [
    { label: 'New', value: LoanApplicationStatus.New },
    { label: 'Approved', value: LoanApplicationStatus.Approved },
    { label: 'Funded', value: LoanApplicationStatus.Funded }
  ]

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router, private snackBar: MatSnackBar) {
    this.applicationForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [null, [Validators.required, Validators.email]],
      applicationNumber: [null, [Validators.required]],
      status: [LoanApplicationStatus.New, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(1)]],
      monthlyPaymentAmount: [null, [Validators.required, Validators.min(1)]],
      term: [null, [Validators.required, Validators.min(1)]],
    });
  }
  saveApplication(): void {
    if (this.applicationForm.valid) {
      const v = this.applicationForm.value;
      const application: LoanApplication = {
        applicationNumber: v.applicationNumber,
        loanTerms: {
          amount: v.amount,
          monthlyPaymentAmount: v.monthlyPaymentAmount,
          term: v.term
        },
        personalInformation: {
          name: {
            first: v.firstName,
            last: v.lastName
          },
          phoneNumber: String(v.phoneNumber),
          email: v.email
        },
        dateApplied: new Date().toISOString(),
        status: v.status
      };
      this.apiService.createApplication(application).subscribe({
        next: (res) => {
          this.snackBar.open(res?.message ?? 'Application created successfully.', 'Close', { duration: 3000 });
          this.router.navigate(['/applications']);
        },
        error: () => {
          this.snackBar.open('Failed to create application.', 'Close', { duration: 3000 });
        }
      } );
    }
  }
}
