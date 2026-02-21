import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoanApplication } from "./models/loan-application.model";

@Injectable({ providedIn: "root" })
// This service acts as the bridge between Angular and the ASP.NET backend API
export class ApiService {
  // Base route for all ApplicationManager endpoints
  private readonly baseUrl = "/ApplicationManager";

  constructor(private http: HttpClient) {}

  // GET: Load all applications from backend
  getApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/GetApplications`);
  }

  // POST: Create a new application
  createApplication(app: LoanApplication): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/CreateApplication`,
      app
    );
  }

  // PUT: Update an existing application (uses applicationNumber as identifier)
  updateApplication(applicationNumber: string, app: LoanApplication): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/UpdateApplication/${encodeURIComponent(applicationNumber)}`,
      app
    );
  }

  // DELETE: Remove an application by applicationNumber
  deleteApplication(applicationNumber: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/DeleteApplication/${encodeURIComponent(applicationNumber)}`
    );
  }
}
