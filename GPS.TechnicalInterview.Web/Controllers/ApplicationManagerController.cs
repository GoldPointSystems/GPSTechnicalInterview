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
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Phone) ||
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

        // TODO: Add your CRUD (Read, Update, Delete) methods here:
        [HttpGet("[action]")]
        public async Task<IActionResult> GetApplications()
        {
            var content = await System.IO.File.ReadAllTextAsync(_filePath);
            return Ok(content);
        }

        [HttpGet("[action]/{appNumber}")]
        public async Task<IActionResult> GetApplication([FromRoute] string appNumber)
        {
            var content = await System.IO.File.ReadAllTextAsync(_filePath);
            var applications = JsonSerializer.Deserialize<List<LoanApplication>>(content);
            var appToEdit = applications.FirstOrDefault(app => app.ApplicationNumber == appNumber.ToString());

            return Ok(appToEdit);
        }

        [HttpDelete("[action]")]
        public async Task<IActionResult> DeleteApplication([FromBody] int appNumber)
        {
            var content = await System.IO.File.ReadAllTextAsync(_filePath);
            var applications = JsonSerializer.Deserialize<List<LoanApplication>>(content);
            var appToRemove = applications.FirstOrDefault(app => app.ApplicationNumber == appNumber.ToString());
            applications.Remove(appToRemove);

            var updatedJson = JsonSerializer.Serialize(applications, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await System.IO.File.WriteAllTextAsync(_filePath, updatedJson);

            return Ok(new { message = "Deleted Successfully." });
        }

        [HttpPut("[action]")]
        public async Task<IActionResult> EditApplication([FromBody] LoanApplication loanApplication)
        {
            if (loanApplication == null ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.First) ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.Last) ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Phone) ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Email) ||
                string.IsNullOrEmpty(loanApplication.ApplicationNumber) ||
                loanApplication.LoanTerms.Amount <= 0)
            {
                return BadRequest("Invalid application data. All fields are required and must be valid.");
            }


            var applications = await GetApplicationsFromFileAsync();

            var appToEdit = applications.FirstOrDefault(app => app.ApplicationNumber == loanApplication.ApplicationNumber);

            if (appToEdit == null)
            {
                return NotFound("Application not found.");
            }

            var index = applications.FindIndex(a => a.ApplicationNumber == loanApplication.ApplicationNumber);
            applications[index] = loanApplication;


            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Edited Successfully." });
        }
    }
}
