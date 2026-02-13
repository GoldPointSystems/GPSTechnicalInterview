import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoanApplication } from "./models/loan-application.model";

export interface ApiMessage {
    message: string;
}

@Injectable({providedIn: 'root'})
export class ApiService {
    constructor(private http: HttpClient) {}

    getApplications(): Observable<LoanApplication[]> {
        return this.http.get<LoanApplication[]>('/ApplicationManager/GetApplications');
    }

    getApplication(applicationNumber: string): Observable<LoanApplication> {
        return this.http.get<LoanApplication>(`/ApplicationManager/GetApplicationByNumber/${applicationNumber}`);
    }

    createApplication(application: LoanApplication): Observable<ApiMessage> {
        return this.http.post<ApiMessage>('/ApplicationManager/CreateApplication', application);
    }

    updateApplication(applicationNumber: string, application: LoanApplication): Observable<ApiMessage> {
        return this.http.put<ApiMessage>(`/ApplicationManager/UpdateApplication/${applicationNumber}`, application);
    }
    
    deleteApplication(applicationNumber: string): Observable<ApiMessage> {
        return this.http.delete<ApiMessage>(`/ApplicationManager/DeleteApplication/${applicationNumber}`);
    }
}