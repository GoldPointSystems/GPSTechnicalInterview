import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpHeaders } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class ApiService {
    private baseUrl = '/ApplicationManager';

    constructor(private http: HttpClient) { }

    createApplication(applicationData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/CreateApplication`, applicationData);
    }

    getApplications(): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/GetApplications`);
    }

    getApplication(appNumber: any): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/GetApplication/${appNumber}`);
    }

    editApplication(applicationData: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/EditApplication`, applicationData);
    }

    deleteApplication(appNumber: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        const url = "https://localhost:5001/ApplicationManager/DeleteApplication"
        return this.http.request('DELETE', url, {
            body: appNumber,
            headers: headers,
            observe: 'response' 
        });
    }

}