using System;

namespace GPS.ApplicationManager.Web.Controllers.Models
{
  // Main model that represents a loan application
  // This structure is shared with the frontend (Angular),
  // so both sides need to match for data to work correctly
  public class LoanApplication
  {
    // Unique identifier for each application
    // I enforced uniqueness in the Create endpoint to prevent duplicates
    public string ApplicationNumber { get; set; }

    // Nested object for loan-specific data (amount, terms, etc.)
    public LoanTerms LoanTerms { get; set; }

    // Nested object for user/customer info
    // Includes Name object (First + Last)
    public PersonalInformation PersonalInformation { get; set; }

    // Timestamp for when the application was created
    // Set on the backend to ensure consistency
    public DateTime DateApplied { get; set; }

    // Enum stored as number (0,1,2)
    // Converted to readable labels (New, Approved, Funded) in Angular UI
    public ApplicationStatus Status { get; set; }
  }
}
