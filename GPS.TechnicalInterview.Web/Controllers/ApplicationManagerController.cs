using GPS.ApplicationManager.Web.Controllers.Models;
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
    private static readonly string _filePath = "loanApplication.json";

    public ApplicationManagerController(ILogger<ApplicationManagerController> logger)
    {
      _logger = logger;
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
      return Ok(new { message = "Created Successfully." });
    }

    [HttpGet("[action]")]
    public async Task<IActionResult> GetApplications() // This method retrieves all loan applications from the JSON file and returns them as a response.
    {
      var applications = await GetApplicationsFromFileAsync();
      return Ok(applications);
    }

    [HttpGet("[action]/{applicationNumber}")]
    public async Task<IActionResult> GetApplicationByNumber(string applicationNumber) // This method retrieves a specific loan application based on the provided application number. 
    {
      var applications = await GetApplicationsFromFileAsync();
      var application = applications.Find(app => app.ApplicationNumber == applicationNumber);
      if (application == null)
      {
        return NotFound(new { message = "Application not found." });
      }
      return Ok(application);
    }

    [HttpPut("[action]/{applicationNumber}")]
    public async Task<IActionResult> UpdateApplication(string applicationNumber, [FromBody] LoanApplication updatedApplication) // This method updates an existing loan application based on the provided application number and the updated application data.
    {
      if (updatedApplication == null ||
          string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.First) ||
          string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.Last) ||
          string.IsNullOrEmpty(updatedApplication.PersonalInformation.PhoneNumber) ||
          string.IsNullOrEmpty(updatedApplication.PersonalInformation.Email) ||
          updatedApplication.LoanTerms.Amount <= 0)
      {
        return BadRequest("Invalid application data. All fields are required and must be valid.");
      }

      var applications = await GetApplicationsFromFileAsync();
      var index = applications.FindIndex(app => app.ApplicationNumber == applicationNumber);
      if (index == -1)
      {
        return NotFound(new { message = "Application not found." });
      }

      updatedApplication.ApplicationNumber = applicationNumber; // Ensure the application number remains unchanged
      updatedApplication.DateApplied = applications[index].DateApplied; // Preserve original date applied
      applications[index] = updatedApplication;

      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Updated Successfully." });
    }
    [HttpDelete("[action]/{applicationNumber}")]
    public async Task<IActionResult> DeleteApplication(string applicationNumber) // This method deletes a specific loan application based on the provided application number.
    {
      var applications = await GetApplicationsFromFileAsync();
      var index = applications.FindIndex(app => app.ApplicationNumber == applicationNumber);
      if (index == -1)
      {
        return NotFound(new { message = "Application not found." });
      }

      applications.RemoveAt(index);
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Deleted Successfully." });
    }
  }
}
