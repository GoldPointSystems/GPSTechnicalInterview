import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../api.service';
import { ApplicationStatus } from '../../models/application-status.enum';

@Component({
    selector: 'app-create-application',
    templateUrl: './create-application.component.html',
    styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent implements OnInit {

    public applicationForm: FormGroup;
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];
    public isUpdateMode: boolean = false;
    public buttonText: string = 'Save';

    constructor(
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
    ) {
        this.applicationForm = this.formBuilder.group({
            firstName: [null, Validators.required],
            lastName: [null, Validators.required],
            phoneNumber: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
            email: [null, [Validators.required, Validators.email]],
            applicationNumber: [null, Validators.required],
            status: ['New', Validators.required],
            amount: [null, Validators.required],
            monthlyPayAmount: [null],
            terms: [null, Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.url.subscribe(url => {
            if (url.some(segment => segment.path === 'update-application')) {
                this.isUpdateMode = true;
                this.buttonText = 'Update';
                const applicationId = this.route.snapshot.paramMap.get('id');
                if (applicationId) {
                    console.log("applicationId: ", applicationId);
                    this.loadApplication(applicationId);
                }
            //    this.applicationForm.get('applicationNumber')!.disable();
            }
        });

        this.applicationForm.get('amount')!.valueChanges.subscribe(() => {
            this.calculateMonthlyPayment();
        });

        this.applicationForm.get('terms')!.valueChanges.subscribe(() => {
            this.calculateMonthlyPayment();
        });

    //    this.applicationForm.get('monthlyPayAmount')!.disable();
    }

    loadApplication(applicationId: string): void {
        this.apiService.getApplicationById(applicationId).subscribe({
            next: (data) => {
                console.log(data);
                this.applicationForm.patchValue({
                    firstName: data.personalInformation.name.first,
                    lastName: data.personalInformation.name.last,
                    phoneNumber: data.personalInformation.phoneNumber,
                    email: data.personalInformation.email,
                    applicationNumber: data.applicationNumber,
                    status: ApplicationStatus[data.status],
                    amount: data.loanTerms.amount,
                    terms: data.loanTerms.terms,
                    monthlyPayAmount: data.loanTerms.monthlyPayment,
                });
            },
            error: (error) => {
                console.error('Error loading application', error);
            }
        });
    }

    onSave(): void {
        if (this.applicationForm.valid) {
            const formValue = this.applicationForm.value;
            const payload = {
                applicationNumber: formValue.applicationNumber,
                status: ApplicationStatus[formValue.status as keyof typeof ApplicationStatus], // Map status to enum value
                loanTerms: {
                    amount: formValue.amount,
                    terms: formValue.terms,
                    monthlyPayment: formValue.monthlyPayAmount
                },
                personalInformation: {
                    name: {
                        first: formValue.firstName,
                        last: formValue.lastName
                    },
                    phoneNumber: formValue.phoneNumber,
                    email: formValue.email
                },
                dateApplied: new Date().toISOString() // Add dateApplied if needed
            };

            if (this.isUpdateMode) {
                this.apiService.updateApplication(payload).subscribe({
                    next: (response) => {
                        console.log('Application updated successfully', response);
                        this.snackBar.open('Application updated successfully', 'Close', {
                            duration: 3000,
                        });
                        this.router.navigate(['/applications']);
                    },
                    error: (error) => {
                        console.error('Error updating application', error);
                    }
                });
            } else {
                this.apiService.createApplication(payload).subscribe({
                    next: (response) => {
                        console.log('Application created successfully', response);
                        this.snackBar.open('Application created successfully', 'Close', {
                            duration: 3000,
                        });
                        this.router.navigate(['/applications']);
                    },
                    error: (error) => {
                        console.error('Error creating application', error);
                    }
                });
            }
        } else {
            this.markFormGroupTouched(this.applicationForm);
            console.error('Form is invalid');
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            if (control) {
                if (control instanceof FormGroup) {
                    this.markFormGroupTouched(control);
                } else {
                    control.markAsTouched();
                }
            }
        });
    }

    private calculateMonthlyPayment(): void {
        const amount = this.applicationForm.get('amount')!.value;
        const terms = this.applicationForm.get('terms')!.value;

        if (amount && terms) {
            const monthlyPayment = amount / terms;
            this.applicationForm.get('monthlyPayAmount')!.setValue(monthlyPayment, { emitEvent: false });
        }
    }
}