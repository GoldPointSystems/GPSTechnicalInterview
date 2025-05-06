import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router';
import { LoanApplication, ApplicationStatus } from '../LoanApplication.model';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';

@Component({
  selector: 'edit-applications',
  templateUrl: './edit-applictaions.component.html',
  styleUrls: ['./edit-application.component.scss']
})

export class EditApplicationsComponent implements OnInit {
  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];
  private mpa?: string;
  error = signal('')

  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private dataService = inject(DataService);
  private applicationNumber = this.dataService.getApplicationNumber();

  constructor(private formBuilder: FormBuilder) {
    this.applicationForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, [
        Validators.required, 
        Validators.pattern(/^\d{10}$/)
      ]],
      email: [null, [
        Validators.required,
        Validators.email
      ]],
      applicationNumber: [null],
      status: ['New', Validators.required],
      amount: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000),
        Validators.pattern(/^\d/)
      ]],
      monthlyPayAmount: [null],
      terms: [null, [Validators.required,
        Validators.min(1),
        Validators.max(600),
        Validators.pattern(/^\d/)
      ]],
    });
  }

  onEnterValue() {
    const amount = parseFloat(this.applicationForm.get('amount')?.value);
    const terms = parseInt(this.applicationForm.get('terms')?.value);

    if (terms && amount) {
      this.mpa = (amount/terms).toFixed(2);
      this.applicationForm.patchValue({
        monthlyPayAmount: this.mpa
      });
    }

    if (!terms || !amount) {
      this.applicationForm.patchValue({
        monthlyPayAmount: null
      });
    }
  }

  onSubmit() {
    if (this.applicationForm.valid) {
      //const applicationData: LoanApplication = this.applicationForm.value;
      const applicationData: LoanApplication = {
        ApplicationNumber: this.applicationForm.get('applicationNumber')?.value,
        LoanTerms: {
          Amount: this.applicationForm.get('amount')?.value,
          Terms: this.applicationForm.get('terms')?.value
        },
        PersonalInformation: {
          Name: {
            First: this.applicationForm.get('firstName')?.value,
            Last: this.applicationForm.get('lastName')?.value
          },
          PhoneNumber: this.applicationForm.get('phoneNumber')?.value,
          Email: this.applicationForm.get('email')?.value
        },
        Status: ApplicationStatus[this.applicationForm.get('status')?.value as keyof typeof ApplicationStatus]
      }

      const subscription = this.apiService.editApplication(this.applicationNumber, applicationData).subscribe({
        error: (error: Error) => {
          this.error.set(error.message);
        },

        next: (message) => {
          //snackbar
          let sb = this.snackBar.open(message.message, 'OK', {duration: 3000});
          if (message.message === "Updated Successfully.") { 
            sb.afterDismissed().subscribe(nav => {
              this.router.navigate(['/applications'])
          });}
        }
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      })
      
    } else {
      this.applicationForm.markAllAsTouched()
      this.snackBar.open('Please fill out all required fields.', 'OK', {duration: 5000});
    }
  }

  ngOnInit() {
    const subscription = this.apiService.getApplicationById(this.applicationNumber).subscribe({
      next: (data) => {
        this.applicationForm.setValue({
          firstName: data.personalInformation.name.first,
          lastName: data.personalInformation.name.last,
          phoneNumber: data.personalInformation.phoneNumber,
          email: data.personalInformation.email,
          applicationNumber: data.applicationNumber,
          status: ApplicationStatus[data.status as keyof typeof ApplicationStatus],
          amount: data.loanTerms.amount,
          monthlyPayAmount: ((data.loanTerms.amount/data.loanTerms.terms).toFixed(2)) + "",
          terms: data.loanTerms.terms
        })
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
