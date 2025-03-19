import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'https://localhost:5001/ApplicationManager';

    constructor(private http: HttpClient) { }

    createApplication(application: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/CreateApplication`, application);
    }

    getApplications(): Observable<any> {
        return this.http.get(`${this.apiUrl}/GetApplications`);
    }

    getApplicationById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/GetApplicationById/${id}`);
    }

    updateApplication(application: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/UpdateApplication`, application);
    }

    deleteApplication(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/DeleteApplication/${id}`);
    }
}
