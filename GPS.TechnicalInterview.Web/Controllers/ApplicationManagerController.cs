using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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

      var applications = await GetApplicationsFromFileAsync();
      if (applications.Any(a => a.ApplicationNumber == loanApplication.ApplicationNumber))
      {
        return Conflict(new { message = "An application with this number already exists." });
      }

      loanApplication.DateApplied = DateTime.UtcNow;
      applications.Add(loanApplication);
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Created Successfully." });
    }

    [HttpGet("[action]")]
    public async Task<IActionResult> GetApplications()
    {
      var applications = await GetApplicationsFromFileAsync();
      return Ok(applications);
    }

    [HttpGet("[action]/{applicationNumber}")]
    public async Task<IActionResult> GetApplication(string applicationNumber)
    {
      var applications = await GetApplicationsFromFileAsync();
      var application = applications.FirstOrDefault(a => a.ApplicationNumber == applicationNumber);
      if (application == null)
      {
        return NotFound(new { message = "Application not found." });
      }
      return Ok(application);
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
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Saved Successfully." });
    }

    [HttpDelete("[action]/{applicationNumber}")]
    public async Task<IActionResult> DeleteApplication(string applicationNumber)
    {
      var applications = await GetApplicationsFromFileAsync();
      var index = applications.FindIndex(a => a.ApplicationNumber == applicationNumber);
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
