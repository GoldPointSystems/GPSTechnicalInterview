using System;


namespace GPS.ApplicationManager.Web.Controllers.Models
{
  public class LoanApplication
  {
    public string ApplicationNumber { get; set; }
    public LoanTerms LoanTerms { get; set; }
    public PersonalInformation PersonalInformation { get; set; }
    public DateTime DateApplied { get; set; }
    public ApplicationStatusEnum ApplicationStatus { get; set; }
  }
}
