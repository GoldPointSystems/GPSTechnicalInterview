import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoanApplicationDto } from "./models/LoanApplicationDto";

@Injectable({ providedIn: 'root' })
export class ApiService {

    private baseUrl = 'https://localhost:5001/api/applicationManager';

    constructor(private http: HttpClient) { }

    createApplication(applicationData: LoanApplicationDto): Observable<any> {
        return this.http.post<LoanApplicationDto>(`${this.baseUrl}/CreateApplication`, applicationData);
    }

    getApplication(applicationNumber: string): Observable<LoanApplicationDto> {
        return this.http.get<LoanApplicationDto>(`${this.baseUrl}/GetApplication/${applicationNumber}`);
    }

    updateApplication(applicationData: LoanApplicationDto): Observable<any> {
        return this.http.put<LoanApplicationDto>(`${this.baseUrl}/UpdateApplication`, applicationData);
    }

    deleteApplication(applicationNumber: string): Observable<any> {
        return this.http.delete<LoanApplicationDto>(`${this.baseUrl}/DeleteApplication/${applicationNumber}`);
    }

    getAllApplications(): Observable<LoanApplicationDto[]> {
        return this.http.get<LoanApplicationDto[]>(`${this.baseUrl}/GetAllApplications`);
    }

    applicationExists(applicationNumber: string): Observable<{ exists: boolean }> {
        return this.http.get<{ exists: boolean }>(`${this.baseUrl}/ApplicationExists/${applicationNumber}`);
    }
}