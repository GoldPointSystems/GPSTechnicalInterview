namespace GPS.ApplicationManager.Web.Controllers.Models
{
    // Represents a person's name as expected by the API
    // I had to create this after realizing the controller expected a nested Name object
    public class Name
    {
        public string First { get; set; }
        public string Last { get; set; }
    }
}