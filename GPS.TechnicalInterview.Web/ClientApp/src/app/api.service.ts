import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class ApiService {
    private baseUrl = '/ApplicationManager';

    constructor(private http: HttpClient) {}

    getApplications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/GetApplications`);
    }

    createApplication(application: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/CreateApplication`, application);
    }

    updateApplication(application: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/UpdateApplication`, application);
    }

    deleteApplication(applicationNumber: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/DeleteApplication/${applicationNumber}`);
    }
}
