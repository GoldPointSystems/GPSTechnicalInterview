using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace GPS.ApplicationManager.Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class ApplicationManagerController : ControllerBase
  {
    private readonly ILogger<ApplicationManagerController> _logger;
    private readonly MongoDBService _mongoDbService; // Set up the service to use the functions
    private static readonly string _filePath = "loanApplication.json";

    public ApplicationManagerController(ILogger<ApplicationManagerController> logger, MongoDBService mongoService)
    {
      _logger = logger;
      _mongoDbService = mongoService;
    }

    private async static Task<List<LoanApplication>> GetApplicationsFromFileAsync()
    {
      if (System.IO.File.Exists(_filePath))
      {
        var existingJson = await System.IO.File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<LoanApplication>>(existingJson) ?? new List<LoanApplication>();
      }
      return new List<LoanApplication>();
    }

    [HttpPost("[action]")]
    public async Task<IActionResult> CreateApplication([FromBody] LoanApplication loanApplication)
    {
      // _logger.LogInformation("Received application: " + JsonSerializer.Serialize(loanApplication)); // DEBUG
      if (loanApplication == null ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.First) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.Last) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.PhoneNumber) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Email) ||
          string.IsNullOrEmpty(loanApplication.ApplicationNumber) ||
          loanApplication.LoanTerms.Amount <= 0)
      {
        return BadRequest("Invalid application data. All fields are required and must be valid.");
      }

      loanApplication.DateApplied = DateTime.UtcNow;
      var applications = await GetApplicationsFromFileAsync();
      applications.Add(loanApplication);
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);

      await _mongoDbService.CreateApplication(loanApplication);

      return Ok(new { message = "Created Successfully." });
    }

    // TODO: Add your CRUD (Read, Update, Delete) methods here:


    [HttpGet("all")]
    public async Task<IActionResult> GetAllApplications()
    {
      var applications = await _mongoDbService.GetAllApplications();
      return Ok(applications);
    }

    [HttpGet("{applicationNumber}")]
    public async Task<IActionResult> GetApplicationByApplicationNumber(string applicationNumber)
    {
      var application = await _mongoDbService.GetApplicationByNumber(applicationNumber);
      _logger.LogInformation("existing_appplication: " + JsonSerializer.Serialize(application));
      if (application == null)
      {
        return NotFound(new { message = "Application not found" });
      }
      return Ok(application);
    }

    [HttpPut("update/{applicationNumber}")]
    public async Task<IActionResult> UpdateApplication([FromRoute] string applicationNumber, [FromBody] LoanApplication updatedApplication)
    {
      
      var existing_application = await _mongoDbService.GetApplicationByNumber(applicationNumber);
      _logger.LogInformation("existing_appplication: " + JsonSerializer.Serialize(existing_application));
      if (existing_application == null)
      {
        return NotFound(new { message = "Application to update not found" });
      }
      updatedApplication.uniqueID = existing_application.uniqueID;
      _logger.LogInformation("Upda Application: " + JsonSerializer.Serialize(updatedApplication));
      await _mongoDbService.UpdateApplication(applicationNumber, updatedApplication);
      return Ok(new { message = "Updated the application!" });
    }

    [HttpDelete("delete-application/{applicationNumber}")]
    public async Task<IActionResult> DeleteApplication([FromRoute] string applicationNumber)
    {
      Console.WriteLine($"Received application number: {applicationNumber}");
      if (string.IsNullOrEmpty(applicationNumber))
      {
        return BadRequest(new { message = "Application number is missing" });
      }
      var existing_application = await _mongoDbService.GetApplicationByNumber(applicationNumber);
      if (existing_application == null)
      {
        return NotFound(new { message = "Application to delete not found" });
      }

      await _mongoDbService.DeleteApplication(applicationNumber);
      return Ok(new { message = "Deleted the application!" });
    }
  }
}
