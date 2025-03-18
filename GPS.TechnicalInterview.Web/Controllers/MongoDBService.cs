using GPS.ApplicationManager.Web.Controllers.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MongoDBService
{
    private readonly IMongoCollection<LoanApplication> _applications;

    // Constructor. Setting up the connection to MongoDB
    public MongoDBService()
    {
        var client = new MongoClient("mongodb://localhost:27017/");
        var database = client.GetDatabase("Loans");
        _applications = database.GetCollection<LoanApplication>("LoanApplications");
    }

    public async Task<List<LoanApplication>> GetAllApplications()
    {
        return await _applications.Find(app => true).ToListAsync();
    }

    public async Task<LoanApplication> GetApplicationByNumber(string applicationNumber)
    {
        Console.WriteLine("Made it here!");
        return await _applications.Find(app => app.ApplicationNumber == applicationNumber).FirstOrDefaultAsync();
    }

    public async Task CreateApplication(LoanApplication application)
    {
        await _applications.InsertOneAsync(application);
    }

    public async Task UpdateApplication(string applicationNumber, LoanApplication updatedApplication)
    {
        Console.WriteLine($"Old application number: {applicationNumber}");
        Console.WriteLine($"New application number: {updatedApplication.ApplicationNumber}");
        await _applications.ReplaceOneAsync(app => app.ApplicationNumber == applicationNumber, updatedApplication);
    }

    public async Task DeleteApplication(string applicationNumber)
    {
        await _applications.DeleteOneAsync(app => app.ApplicationNumber == applicationNumber);
    }
}