import { Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { ApplicationBrief, ApplicationStatus } from '../LoanApplication.model';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit{
  error = signal('')

  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  dataService = inject(DataService);
  
  public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'menu'];
  dataSource: Array<ApplicationBrief> = [];

  ngOnInit() {
    const subscription = this.apiService.readApplications().subscribe({
      next: (data) => {
        this.dataSource = data.map<ApplicationBrief>(
          (application): ApplicationBrief => {
            return {
              ApplicationNumber: application.applicationNumber,
              Amount: application.loanTerms.amount,
              DateApplied: application.dateApplied,
              Status: ApplicationStatus[application.status as keyof typeof ApplicationStatus]
            };
          }
        )
      },
      error: (error: Error) => {
        this.error.set(error.message)
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onClick (an: string) {
    this.dataService.setApplicationNumber(an);
  }

  onDelete (an: string) {
    console.log(an)
  }

  constructor() { }
}