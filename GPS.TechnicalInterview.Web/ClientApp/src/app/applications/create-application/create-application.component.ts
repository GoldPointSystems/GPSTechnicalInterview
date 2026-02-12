import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { LoanApplicationDto } from '../../models/LoanApplicationDto';
import { EMPTY, switchMap, finalize } from 'rxjs';
import { ApplicationStatusEnum } from '../../models/ApplicationStatusEnum';

@Component({
    selector: 'app-create-application',
    templateUrl: './create-application.component.html',
    styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {

    public applicationForm: FormGroup;
    ApplicationStatusEmum = ApplicationStatusEnum;
    public statuses = ApplicationStatusEnum.getKeys();

    public isSubmitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private router: Router,
        private apiService: ApiService) {
        this.applicationForm = this.buildForm();
    }

    ngOnInit() {
        // Listen for changes to the phone number field and keep it to 10 digits, allowing only numeric characters.
        this.applicationForm.get('phoneNumber')?.valueChanges.subscribe((value) => {
            if (value) {
                const cleaned = value.replace(/\D/g, '').slice(0, 10);
                this.applicationForm.get('phoneNumber')?.setValue(cleaned, { emitEvent: false });
            }
        });

        // recalculate monthly payment amount whenever amount or terms change
        this.applicationForm.valueChanges.subscribe(values => {
            if (!values) {
                return;
            }

            const amount = Number(values.amount || 0);
            const term = Number(values.terms || 0);

            const monthlyControl = this.applicationForm.get('monthlyPayAmount');
            if (!monthlyControl) {
                return;
            }

            if (amount > 0 && term > 0) {
                const monthly = (amount / term).toFixed(2);

                if (monthlyControl.value !== monthly) {
                    monthlyControl.setValue(monthly, { emitEvent: false });
                }
            } else {
                monthlyControl.setValue('', { emitEvent: false });
            }
        });
    }

    onSubmit() {
        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            return;
        }

        const applicationNumber = this.applicationForm.value.applicationNumber;

        //Verify that the application number is unique before submitting the form.
        this.apiService.applicationExists(applicationNumber)
            .pipe(
                switchMap(res => {
                    if (res.exists) {
                        this.snackBar.open('Application number already exists', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        });
                        // Stop the chain by returning EMPTY observable
                        return EMPTY;
                    }

                    const applicationData: LoanApplicationDto = {
                        applicationNumber: applicationNumber,
                        loanTerms: {
                            amount: this.applicationForm.value.amount,
                            monthlyPaymentAmount: this.applicationForm.value.monthlyPayAmount,
                            term: this.applicationForm.value.terms
                        },
                        personalInformation: {
                            name: {
                                firstName: this.applicationForm.value.firstName,
                                lastName: this.applicationForm.value.lastName,
                            },
                            phoneNumber: this.applicationForm.value.phoneNumber,
                            email: this.applicationForm.value.email
                        },
                        dateApplied: new Date(),
                        applicationStatus: Number(this.applicationForm.value.status[0])
                    };

                    this.isSubmitting = true;
                    this.applicationForm.disable();

                    return this.apiService.createApplication(applicationData);
                }),
                finalize(() => {
                    this.isSubmitting = false;
                    this.applicationForm.enable();
                })
            )
            .subscribe({
                next: () => {
                    this.snackBar.open('Created Successfully', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                    this.router.navigate(['/app-applications']);
                },
                error: (err) => {
                    console.error('Failed to save application:', err);
                    this.snackBar.open(
                        'Failed to save application. Please try again.',
                        'Close',
                        {
                            duration: 3000,
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        }
                    );
                }
            });
    }

    // Convenience getter for easy access to form fields in the template
    get f() {
        return this.applicationForm.controls;
    }

    buildForm(): FormGroup {
        return this.formBuilder.group({
            firstName: [null, Validators.required],
            lastName: [null, Validators.required],
            //Phone number should be exactly 10 digits and only allow numeric input.
            phoneNumber: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
            email: [null, [Validators.required, Validators.email]],
            applicationNumber: [null, Validators.required],
            status: ['New', Validators.required],
            // Amount should be a positive number with up to two decimal places.
            amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
            monthlyPayAmount: [null],
            terms: [null, [Validators.required, Validators.min(1)]],
            dateApplied: [new Date(), Validators.required]
        });
    }
}
