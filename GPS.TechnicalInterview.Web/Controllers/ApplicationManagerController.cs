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
    [Route("api/[controller]")]
    public class ApplicationManagerController : ControllerBase
    {
        private readonly ILogger<ApplicationManagerController> _logger;
        private static readonly string _filePath = "loanApplication.json";

        public ApplicationManagerController(ILogger<ApplicationManagerController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Asynchronously loads a list of loan applications from the file specified by the current file path.
        /// </summary>
        /// <returns>A list of <see cref="LoanApplication"/> objects deserialized from the file.</returns>
        private async static Task<List<LoanApplication>> GetApplicationsFromFileAsync()
        {
            if (System.IO.File.Exists(_filePath))
            {
                var existingJson = await System.IO.File.ReadAllTextAsync(_filePath);
                return JsonSerializer.Deserialize<List<LoanApplication>>(existingJson) ?? new List<LoanApplication>();
            }
            return new List<LoanApplication>();
        }

        /// <summary>
        /// Creates a new loan application using the provided application data.
        /// </summary>
        /// <param name="loanApplication">The loan application to create.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateApplication([FromBody] LoanApplication loanApplication)
        {
            if (loanApplication == null ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.FirstName) ||
                string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.LastName) ||
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

        /// <summary>
        /// Retrieves the application with the specified application number.
        /// </summary>
        /// <param name="applicationNumber">The unique identifier of the application to retrieve.</param>
        /// <returns>— An <see cref="IActionResult"/> that contains the application data if found</returns>
        [HttpGet("[action]/{applicationNumber}")]
        public async Task<IActionResult> GetApplication(string applicationNumber)
        {
            var applications = await GetApplicationsFromFileAsync();
            var application = applications.Find(app => app.ApplicationNumber == applicationNumber);
            if (application == null)
            {
                return NotFound("Application not found.");
            }
            return Ok(application);
        }

        /// <summary>
        /// Updates an existing loan application with new information.
        /// </summary>
        /// <param name="updatedApplication">The updated <see cref="LoanApplication"/> object containing the new application details.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the update operation.</returns>
        [HttpPut("[action]")]
        public async Task<IActionResult> UpdateApplication([FromBody] LoanApplication updatedApplication)
        {
            if (updatedApplication == null ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.FirstName) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Name.LastName) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.PhoneNumber) ||
                string.IsNullOrEmpty(updatedApplication.PersonalInformation.Email) ||
                string.IsNullOrEmpty(updatedApplication.ApplicationNumber) ||
                updatedApplication.LoanTerms.Amount <= 0)
            {
                return BadRequest("Invalid application data. All fields are required and must be valid.");
            }
            var applications = await GetApplicationsFromFileAsync();
            var index = applications.FindIndex(app => app.ApplicationNumber == updatedApplication.ApplicationNumber);
            if (index == -1)
            {
                return NotFound("Application not found.");
            }
            updatedApplication.DateApplied = applications[index].DateApplied; // Preserve original date
            applications[index] = updatedApplication;
            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Updated Successfully." });
        }

        /// <summary>
        /// Deletes the application with the specified application number.
        /// </summary>
        /// <param name="applicationNumber">The unique identifier of the application to delete.</param>
        /// <returns>An <see cref="IActionResult"/> that indicates the result of the delete operation.</returns>
        [HttpDelete("[action]/{applicationNumber}")]
        public async Task<IActionResult> DeleteApplication(string applicationNumber)
        {
            var applications = await GetApplicationsFromFileAsync();
            var index = applications.FindIndex(app => app.ApplicationNumber == applicationNumber);
            if (index == -1)
            {
                return NotFound("Application not found.");
            }
            applications.RemoveAt(index);
            var json = JsonSerializer.Serialize(applications);
            await System.IO.File.WriteAllTextAsync(_filePath, json);
            return Ok(new { message = "Deleted Successfully." });
        }

        /// <summary>
        /// Retrieves a list of all applications.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing a collection of all applications.</returns>
        [HttpGet("[action]")]
        public async Task<IActionResult> GetAllApplications()
        {
            var applications = await GetApplicationsFromFileAsync();
            return Ok(applications);
        }

        /// <summary>
        /// Determines whether an application with the specified application number exists.
        /// </summary>
        /// <param name="applicationNumber">The unique identifier of the application to check for existence.</param>
        /// <returns>An <see cref="IActionResult"/> containing a JSON object with a Boolean property.</returns>
        [HttpGet("[action]/{applicationNumber}")]
        public async Task<IActionResult> ApplicationExists(string applicationNumber)
        {
            var applications = await GetApplicationsFromFileAsync();
            var exists = applications.Exists(app => app.ApplicationNumber == applicationNumber);
            return Ok(new { exists });
        }
    }
}
