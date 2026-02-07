using Backend.Configurations;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return new MongoClient(settings?.ConnectionString ?? "mongodb://localhost:27017");
});

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return client.GetDatabase(settings?.DatabaseName ?? "Planno");
});

var app = builder.Build();

app.MapGet("/health", () => Results.Ok("OK"));

app.Run("http://0.0.0.0:8080");
