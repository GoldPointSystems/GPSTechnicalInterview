using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace GPS.ApplicationManager.Web.Controllers
{
  // This makes ASP.NET automatically validate request bodies and return 400's
  [ApiController]
  [Route("[controller]")]
  public class ApplicationManagerController : ControllerBase
  {
    private readonly ILogger<ApplicationManagerController> _logger;

    // The project already uses a JSON file to store applications (no database setup required)
    private static readonly string _filePath = "loanApplication.json";

    public ApplicationManagerController(ILogger<ApplicationManagerController> logger)
    {
      _logger = logger;
    }

    // Helper method: read all applications from the JSON file
    // If the file doesn't exist yet, return an empty list
    private static async Task<List<LoanApplication>> GetApplicationsFromFileAsync()
    {
      if (System.IO.File.Exists(_filePath))
      {
        var existingJson = await System.IO.File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<LoanApplication>>(existingJson) ?? new List<LoanApplication>();
      }

      return new List<LoanApplication>();
    }

    // CREATE: save a new loan application
    [HttpPost("[action]")]
    public async Task<IActionResult> CreateApplication([FromBody] LoanApplication loanApplication)
    {
      // Backend validation: even if the UI validates, the API should still protect itself
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

      var applications = await GetApplicationsFromFileAsync();

      // Data integrity: ApplicationNumber acts like the ID in this project
      // I enforced it as unique so Update/Delete stays predictable
      if (applications.Exists(a => a.ApplicationNumber == loanApplication.ApplicationNumber))
      {
        return Conflict($"Application number '{loanApplication.ApplicationNumber}' already exists.");
      }

      // The backend sets the official DateApplied (don’t trust client clock)
      loanApplication.DateApplied = DateTime.UtcNow;

      applications.Add(loanApplication);

      // Write the updated list back to the JSON file
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);

      return Ok(new { message = "Created Successfully." });
    }

    // READ: return all applications
    [HttpGet("[action]")]
    public async Task<ActionResult<List<LoanApplication>>> GetApplications()
    {
      var applications = await GetApplicationsFromFileAsync();
      return Ok(applications);
    }

    // UPDATE: update a single application using ApplicationNumber as the identifier
    [HttpPut("[action]/{applicationNumber}")]
    public async Task<IActionResult> UpdateApplication(string applicationNumber, [FromBody] LoanApplication updatedApplication)
    {
      if (string.IsNullOrWhiteSpace(applicationNumber) || updatedApplication == null)
        return BadRequest("Invalid application data.");

      // The route parameter is the source of truth for the ID
      // (so somebody can’t change the ID in the request body)
      updatedApplication.ApplicationNumber = applicationNumber;

      var applications = await GetApplicationsFromFileAsync();
      var existingIndex = applications.FindIndex(a => a.ApplicationNumber == applicationNumber);

      if (existingIndex < 0)
        return NotFound($"Application '{applicationNumber}' not found.");

      // Keep the original DateApplied so editing doesn't change history
      updatedApplication.DateApplied = applications[existingIndex].DateApplied;

      applications[existingIndex] = updatedApplication;

      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);

      return Ok(new { message = "Updated Successfully." });
    }

    // DELETE: remove an application
    [HttpDelete("[action]/{applicationNumber}")]
    public async Task<IActionResult> DeleteApplication(string applicationNumber)
    {
      if (string.IsNullOrWhiteSpace(applicationNumber))
        return BadRequest("Application number is required.");

      var applications = await GetApplicationsFromFileAsync();

      // This removes all matches, but duplicates should not exist because Create enforces unique ApplicationNumber
      var removedCount = applications.RemoveAll(a => a.ApplicationNumber == applicationNumber);

      if (removedCount == 0)
        return NotFound($"Application '{applicationNumber}' not found.");

      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);

      return Ok(new { message = "Deleted Successfully." });
    }
  }
}
