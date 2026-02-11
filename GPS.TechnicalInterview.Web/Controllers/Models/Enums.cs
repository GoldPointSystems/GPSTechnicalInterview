using System.Text.Json.Serialization;

namespace GPS.ApplicationManager.Web.Controllers.Models
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public enum ApplicationStatus
  {
    New = 0,
    Approved = 1,
    Funded = 2
  }
}
