import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Application } from '../api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss']
})
export class EditApplicationComponent {

  newApplication: Application = {
    applicationNumber: '',
    loanTerms: {
      amount: 0,
      monthlyPaymentAmount: 0,
      term: 0
    },
    personalInformation: {
      name: {
        first: '',
        last: ''
      },
      phoneNumber: '',
      email: ''
    },
    status: 0,
    dateApplied: new Date()
  };

  
  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];
  public formErrors: string[] = [];
  
  statusMap: {[key: string]: number} = {
    'New': 0,
    'Approved': 1,
    'Funded': 2
  };

  constructor(private formBuilder: FormBuilder
    , private router: Router
    , private apiService: ApiService
    , private snackBar: MatSnackBar
    , private route: ActivatedRoute
  ) {
    this.applicationForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      applicationNumber: ['', Validators.required],
      status: ['New'],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      monthlyPayAmount: [{value: '0.00', disabled: true }],
      terms: [0, [Validators.required, Validators.min(1)]],
    });
  }

  loadApplication(applicationNumber: string): void {
  this.apiService.getApplication(applicationNumber)
    .subscribe(app => {
      this.newApplication = app;

      this.applicationForm.patchValue({
        firstName: app.personalInformation.name.first,
        lastName: app.personalInformation.name.last,
        phoneNumber: app.personalInformation.phoneNumber,
        email: app.personalInformation.email,
        applicationNumber: app.applicationNumber,
        status: this.statuses[app.status],
        amount: app.loanTerms.amount,
        terms: app.loanTerms.term,
        monthlyPayAmount: app.loanTerms.monthlyPaymentAmount.toFixed(2)
      });

      this.applicationForm.get('applicationNumber')?.disable();
    });
}


   ngOnInit(): void {
    // Optionally, calculate monthly payment automatically if needed
    this.applicationForm.get('amount')?.valueChanges.subscribe(() => this.calculateMonthlyPayment());
    this.applicationForm.get('terms')?.valueChanges.subscribe(() => this.calculateMonthlyPayment());
    const applicationNumber = this.route.snapshot.paramMap.get('applicationNumber');
    if (applicationNumber) {
      this.loadApplication(applicationNumber);
    }
  }

  calculateMonthlyPayment(): void {
    const amount = Number(this.applicationForm.get('amount')?.value || 0);
    const term = Number(this.applicationForm.get('terms')?.value || 0);
    if (term > 0) {

      const monthlyPayment = Math.floor((amount / term) * 100) / 100;
      this.applicationForm.get('monthlyPayAmount')?.setValue(monthlyPayment.toFixed(2), { emitEvent: false });
    } else {
      this.applicationForm.get('monthlyPayAmount')?.setValue('0.00', { emitEvent: false });
    }
  }

  onSubmit(): void {
    this.formErrors = [];

    if (this.applicationForm.invalid) {
    this.applicationForm.markAllAsTouched();

    const errors: string[] = [];

    const email = this.applicationForm.get('email');
    if (email?.hasError('required')) errors.push('Email is required.');
    if (email?.hasError('email')) errors.push('Email format is invalid.');

    const phone = this.applicationForm.get('phoneNumber');
    if (phone?.hasError('required')) errors.push('Phone number is required.');
    if (phone?.hasError('pattern')) errors.push('Phone number must be 10 digits and only numbers.');

    const amount = this.applicationForm.get('amount');
    if (amount?.hasError('required')) errors.push('Amount is required.');
    if (amount?.hasError('min')) errors.push('Amount must be greater than 0.');

    const terms = this.applicationForm.get('terms');
    if (terms?.hasError('required')) errors.push('Term is required.');
    if (terms?.hasError('min')) errors.push('Term must be greater than 0.');

    this.formErrors = errors;
    return;
  }

  this.newApplication = {
      applicationNumber: this.applicationForm.get('applicationNumber')?.value,
      loanTerms: {
        amount: this.applicationForm.get('amount')?.value,
        monthlyPaymentAmount: this.applicationForm.get('monthlyPayAmount')?.value,
        term: this.applicationForm.get('terms')?.value
      },
      personalInformation: {
        name: {
          first: this.applicationForm.get('firstName')?.value,
          last: this.applicationForm.get('lastName')?.value
        },
        phoneNumber: this.applicationForm.get('phoneNumber')?.value,
        email: this.applicationForm.get('email')?.value
      },
      status: this.newApplication.status = this.statusMap[this.applicationForm.get('status')?.value],
      dateApplied: new Date(),
    };
    this.apiService.updateApplication(
      this.newApplication.applicationNumber,
      this.newApplication
    ).subscribe({
      next: () => {
        this.snackBar.open('Updated successfully!', 'Ok', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/applications']);
      },
      error: err => {
        console.error('Update failed:', err);
        this.snackBar.open('Update failed', 'Close', { duration: 4000 });
      }
    });
    
  }
}