using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace GPS.ApplicationManager.Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class ApplicationManagerController : ControllerBase
  {
    private readonly ILogger<ApplicationManagerController> _logger;
    private static readonly string _filePath = "loanApplication.json";
    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      Converters = { new JsonStringEnumConverter() }
    };

    public ApplicationManagerController(ILogger<ApplicationManagerController> logger)
    {
      _logger = logger;
    }

    private async static Task<List<LoanApplication>> GetApplicationsFromFileAsync()
    {
      if (System.IO.File.Exists(_filePath))
      {
        var existingJson = await System.IO.File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<LoanApplication>>(existingJson, _jsonOptions) ?? new List<LoanApplication>();
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
      var json = JsonSerializer.Serialize(applications, _jsonOptions);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Created Successfully." });
    }

    // TODO: Add your CRUD (Read, Update, Delete) methods here:

    [HttpGet("[action]")]
    public async Task<IActionResult> GetApplications()
    {
      var applications = await GetApplicationsFromFileAsync();
      return Ok(applications);
    }

    [HttpPut("[action]")]
    public async Task<IActionResult> UpdateApplication([FromBody] LoanApplication loanApplication)
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

      var applications = await GetApplicationsFromFileAsync();
      var index = applications.FindIndex(a => a.ApplicationNumber == loanApplication.ApplicationNumber);
      if (index == -1)
      {
        return NotFound(new { message = "Application not found." });
      }

      loanApplication.DateApplied = applications[index].DateApplied;
      applications[index] = loanApplication;
      var json = JsonSerializer.Serialize(applications, _jsonOptions);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Saved Successfully." });
    }

    [HttpDelete("[action]/{applicationNumber}")]
    public async Task<IActionResult> DeleteApplication(string applicationNumber)
    {
      if (string.IsNullOrEmpty(applicationNumber))
      {
        return BadRequest("Application number is required.");
      }

      var applications = await GetApplicationsFromFileAsync();
      var removed = applications.RemoveAll(a => a.ApplicationNumber == applicationNumber);
      if (removed == 0)
      {
        return NotFound(new { message = "Application not found." });
      }

      var json = JsonSerializer.Serialize(applications, _jsonOptions);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Deleted Successfully." });
    }
  }
}
