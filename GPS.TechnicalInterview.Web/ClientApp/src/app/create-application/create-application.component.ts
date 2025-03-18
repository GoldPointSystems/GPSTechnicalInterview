import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { ApplicationStatus } from '../../models/application-status.enum';



@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {

    public applicationForm: FormGroup;
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];
    public isUpdateMode: boolean = false;
    public buttonText: string = 'Save';

    constructor(
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.applicationForm = this.formBuilder.group({
            firstName: [null],
            lastName: [null],
            phoneNumber: [null],
            email: [null],
            applicationNumber: [null],
            status: ['New'],
            amount: [null],
            monthlyPayAmount: [null],
            terms: [null],
        });
    }

    ngOnInit(): void {
        this.route.url.subscribe(url => {
            if (url.some(segment => segment.path === 'update-application')) {
                this.isUpdateMode = true;
                this.buttonText = 'Update';
                // Optionally, load the existing application data here
                const applicationId = this.route.snapshot.paramMap.get('id');
                if (applicationId) {
                    console.log("applicationId: ", applicationId);
                    this.loadApplication(applicationId);
                }
            }
        });
    }

    loadApplication(applicationId: string): void {
        this.apiService.getApplicationById(applicationId).subscribe(
            (data) => {
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
                });            },
            (error) => {
                console.error('Error loading application', error);
            }
        );
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
                this.apiService.updateApplication(payload).subscribe(
                    (response) => {
                        console.log('Application updated successfully', response);
                        this.router.navigate(['/applications']);
                    },
                    (error) => {
                        console.error('Error updating application', error);
                    }
                );
            } else {
                this.apiService.createApplication(payload).subscribe(
                    (response) => {
                        console.log('Application created successfully', response);
                        this.router.navigate(['/applications']);
                    },
                    (error) => {
                        console.error('Error creating application', error);
                    }
                );
            }
        } else {
            console.error('Form is invalid');
        }
    }
}
