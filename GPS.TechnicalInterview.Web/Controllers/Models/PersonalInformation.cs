namespace GPS.ApplicationManager.Web.Controllers.Models
{
    public class PersonalInformation
    {
        public Name Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
    }

    public class Name
    {
        public string First { get; set; }
        public string Last { get; set; }
    }
}
