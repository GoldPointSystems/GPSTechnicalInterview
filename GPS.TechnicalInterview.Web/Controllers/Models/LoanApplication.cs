using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace GPS.ApplicationManager.Web.Controllers.Models
{
  public class LoanApplication
  {
    // Using a different id for the primary key because the application number could be the same (Defaults to '000000-0000')
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string uniqueID { get; set; }
    public string ApplicationNumber { get; set; }
    public LoanTerms LoanTerms { get; set; }
    public PersonalInformation PersonalInformation { get; set; }
    public DateTime DateApplied { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))] // to get around the ENUM
    public ApplicationStatus Status { get; set; }
  }


  // Code I added

  // Personal Information Class. This might need more stuff but based on what I am seeing this should be enough for now
  public class PersonalInformation
  {
    // Name is a separate class, at least the way it's used in the controller.
    public Name Name { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
  }

  public class Name
  {
    public string First { get; set; }
    public string Last { get; set; }
  }


  // This might need more stuff
  public class LoanTerms
  {
    public int Amount { get; set; }
    public int monthlyPaymentAmount { get; set; }
    public int terms { get; set; }
  }
}
