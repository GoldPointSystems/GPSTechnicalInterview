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

            loanApplication.DateApplied = DateTime.UtcNow;
            var applications = await GetApplicationsFromFileAsync();
            applications.Add(loanApplication);
            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Created Successfully." });
        }

        [HttpGet("hello")]
        public IActionResult HelloWorld()
        {
            return Ok("Hello, World!");
        }

        // TODO: Add your CRUD (Read, Update, Delete) methods here:
        [HttpGet("[action]")]
        public async Task<IActionResult> GetApplications()
        {
            var applications = await GetApplicationsFromFileAsync();
            return Ok(applications);
        }

        [HttpGet("[action]/{id}")]
        public async Task<IActionResult> GetApplicationById(string id)
        {
            var applications = await GetApplicationsFromFileAsync();
            var application = applications.FirstOrDefault(app => app.ApplicationNumber == id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }
            return Ok(application);
        }

        [HttpPut("[action]")]
        public async Task<IActionResult> UpdateApplication([FromBody] LoanApplication updatedApplication)
        {
            if (updatedApplication == null ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.First) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.Last) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.PhoneNumber) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Email) ||
                string.IsNullOrEmpty(updatedApplication.ApplicationNumber) ||
                updatedApplication.LoanTerms.Amount <= 0)
            {
                return BadRequest("Invalid application data. All fields are required and must be valid.");
            }

            var applications = await GetApplicationsFromFileAsync();
            var existingApplication = applications.FirstOrDefault(app => app.ApplicationNumber == updatedApplication.ApplicationNumber);
            if (existingApplication == null)
            {
                return NotFound("Application not found.");
            }

            // Update the existing application with the new data
            existingApplication.PersonalInformation = updatedApplication.PersonalInformation;
            existingApplication.LoanTerms = updatedApplication.LoanTerms;
            existingApplication.Status = updatedApplication.Status;
            existingApplication.DateApplied = updatedApplication.DateApplied;

            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Updated Successfully." });
        }

        [HttpDelete("[action]/{id}")]
        public async Task<IActionResult> DeleteApplication(string id)
        {
            var applications = await GetApplicationsFromFileAsync();
            var application = applications.FirstOrDefault(app => app.ApplicationNumber == id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }

            applications.Remove(application);
            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Deleted Successfully." });
        }
    }
}
