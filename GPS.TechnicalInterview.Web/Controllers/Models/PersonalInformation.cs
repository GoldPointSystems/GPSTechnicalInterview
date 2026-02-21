namespace GPS.ApplicationManager.Web.Controllers.Models
{
    // Holds personal details for the application
    // This structure had to match what the controller was expecting
    public class PersonalInformation
    {
        // Nested Name object (instead of flat FirstName/LastName)
        public Name Name { get; set; } = new Name();

        public string PhoneNumber { get; set; }

        public string Email { get; set; }
    }
}