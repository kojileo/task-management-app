using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.API.Data;

namespace TaskManagement.Tests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // 既存のDbContextの登録を削除
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // テスト用のインメモリデータベースを追加
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });

                // サービスの依存関係を解決
                var sp = services.BuildServiceProvider();

                // テストデータベースの初期化
                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<ApplicationDbContext>();

                    db.Database.EnsureCreated();

                    try
                    {
                        // テストデータの初期化
                        if (!db.Tasks.Any())
                        {
                            db.Tasks.Add(new TaskManagement.API.Models.TaskItem
                            {
                                Id = 1,
                                Title = "Test Task 1",
                                Description = "Test Description 1",
                                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                                DueDate = DateTime.Now.AddDays(7),
                                AssignedTo = "Test User",
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            });

                            db.Tasks.Add(new TaskManagement.API.Models.TaskItem
                            {
                                Id = 2,
                                Title = "Test Task 2",
                                Description = "Test Description 2",
                                Status = TaskManagement.API.Models.TaskStatus.InProgress,
                                DueDate = DateTime.Now.AddDays(14),
                                AssignedTo = "Test User 2",
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            });

                            db.SaveChanges();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An error occurred seeding the database. Error: {ex.Message}");
                    }
                }
            });
        }
    }
} 