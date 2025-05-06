import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoanApplication } from "./LoanApplication.model";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class ApiService {
    constructor(private http: HttpClient) {}

    createApplication (application: LoanApplication) {
        return this.http.post<any>('/ApplicationManager/CreateApplication', application);
    }

    readApplications (): Observable<any[]> {
        return this.http.get<any[]>('/ApplicationManager/ReadApplications');
    }

    getApplicationById (id: string): Observable<any> {
        return this.http.get<any>(`/ApplicationManager/GetApplicationById/${id}`);
    }

    editApplication (id: string, application: LoanApplication) {
        return this.http.put<any>(`/ApplicationManager/EditApplication/${id}`, application);
    }
}