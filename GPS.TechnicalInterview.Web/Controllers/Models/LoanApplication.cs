using System;

namespace GPS.ApplicationManager.Web.Controllers.Models
{
  public class LoanApplication
  {
    public string ApplicationNumber { get; set; }
    public LoanTerms LoanTerms { get; set; }
    public PersonalInformation PersonalInformation { get; set; }
    public DateTime DateApplied { get; set; }
    public ApplicationStatus Status { get; set; }
  }

  public class LoanTerms
  {
    public double Amount { get; set; }
    public double MonthlyPaymentAmount { get; set; }
    public uint Term { get; set; }
  }

  public class PersonalInformation
  {
    public Name Name { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
  }

  public class Name
  {
    public string First { get; set; }
    public string Last { get; set; }
  }
}
