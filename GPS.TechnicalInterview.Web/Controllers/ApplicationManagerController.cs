using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
      if (applications.Any(p => p.ApplicationNumber == loanApplication.ApplicationNumber)) {
        return Accepted(new { message = "This application number already exists." });
      };
      applications.Add(loanApplication);
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Created Successfully." });
    }

    // TODO: Add your CRUD (Read, Update, Delete) methods here:

    [HttpGet("[action]")]
    public async Task<IActionResult> ReadApplications() {
      var applications = await GetApplicationsFromFileAsync();
      if (applications == null) {
        return BadRequest("Applications can't be null.");
      }
      return Ok(applications);
    }

    [HttpGet("[action]/{id}")]
    public async Task<IActionResult> GetApplicationById(string id) {
      var applications = await GetApplicationsFromFileAsync();
      var application = applications.FirstOrDefault(x => x.ApplicationNumber == id);
      if (application == null) {
        return BadRequest("Not Found");
      }
      return Ok(application);
    }

    [HttpPut("[action]/{id}")]
    public async Task<IActionResult> EditApplication(string id, [FromBody] LoanApplication loanApplication) {
      var applications = await GetApplicationsFromFileAsync();
      foreach (LoanApplication la in applications) {
        if (la.ApplicationNumber == id) {
          la.LoanTerms.Amount = loanApplication.LoanTerms.Amount;
          la.LoanTerms.Terms = loanApplication.LoanTerms.Terms;
          la.PersonalInformation.Name.First = loanApplication.PersonalInformation.Name.First;
          la.PersonalInformation.Name.Last = loanApplication.PersonalInformation.Name.Last;
          la.PersonalInformation.PhoneNumber = loanApplication.PersonalInformation.PhoneNumber;
          la.PersonalInformation.Email = loanApplication.PersonalInformation.Email;
          la.Status = loanApplication.Status;
        }
      }
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Updated Successfully." });
    }
  }
}
