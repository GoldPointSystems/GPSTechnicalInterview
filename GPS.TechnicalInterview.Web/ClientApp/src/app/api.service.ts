import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoanApplication } from "./models/loan-application";

@Injectable({providedIn: 'root'})
export class ApiService {
    private baseUrl = '/ApplicationManager';

    constructor(private http: HttpClient) {}

    getApplications(): Observable<LoanApplication[]> {
        return this.http.get<LoanApplication[]>(`${this.baseUrl}/GetApplications`);
    }

    getApplication(applicationNumber: string): Observable<LoanApplication> {
        return this.http.get<LoanApplication>(`${this.baseUrl}/GetApplication/${applicationNumber}`);
    }

    createApplication(application: LoanApplication): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/CreateApplication`, application);
    }

    updateApplication(application: LoanApplication): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/UpdateApplication`, application);
    }

    deleteApplication(applicationNumber: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/DeleteApplication/${applicationNumber}`);
    }
}
