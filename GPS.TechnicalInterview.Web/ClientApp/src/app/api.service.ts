import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


export interface Application {
    applicationNumber: string;
    loanTerms: LoanTerms;
    personalInformation: PersonalInformation;
    status: number;
    dateApplied: Date;
}

export interface LoanTerms{
    amount: number;
    monthlyPaymentAmount: number;
    term: number;
}

export interface PersonalInformation {
    name: Name;
    phoneNumber: string;
    email: string;
}

export interface Name {
    first: string;
    last: string;
}


@Injectable({providedIn: 'root'})
export class ApiService {
    private baseUrl: string = '/ApplicationManager';

    constructor(private http: HttpClient) {}


    public createApplication(LoanApplication: any): Observable<Application> {
        return this.http.post<Application>(`${this.baseUrl}/CreateApplication`, LoanApplication);
    }

    public getApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.baseUrl}/GetAllApplications`);
    }

    public getApplication(applicationNumber: string): Observable<Application> {
        return this.http.get<Application>(`${this.baseUrl}/GetApplication/${applicationNumber}`);
    }

    public updateApplication(applicationNumber: string, applicationData: any): Observable<Application> {
        return this.http.put<Application>(`${this.baseUrl}/UpdateApplication/${applicationNumber}`, applicationData);
    }

    public deleteApplication(id: string): Observable<Application> {
        return this.http.delete<Application>(`${this.baseUrl}/DeleteApplication/${id}`);
    }
}