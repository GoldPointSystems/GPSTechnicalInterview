using System;

namespace GPS.ApplicationManager.Web.Controllers.Models
{
    public class LoanTerms
    {
        public double Amount { get; set; }
        public double MonthlyPaymentAmount { get; set; }
        public uint Term { get; set; }
    }
}
