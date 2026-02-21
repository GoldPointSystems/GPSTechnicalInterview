namespace GPS.ApplicationManager.Web.Controllers.Models
{
    // Represents the loan-specific details for an application
    // This is nested inside LoanApplication
    public class LoanTerms
    {
        // Total loan amount
        public double Amount { get; set; }

        // Monthly payment amount
        public double MonthlyPayment { get; set; }

        // Length of the loan (in months)
        // This had to be an integer, which caused a bug when Angular sent it as a string
        public int Terms { get; set; }
    }
}