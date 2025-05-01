using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models;

namespace TaskManagement.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
            // SQLiteの場合、自動的にデータベースを作成
            Database.EnsureCreated();
        }

        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // インデックスの追加
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.DueDate);

                // バリデーション
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(e => e.Description)
                    .HasMaxLength(500);
                
                entity.Property(e => e.AssignedTo)
                    .IsRequired()
                    .HasMaxLength(50);

                // SQLiteでのタイムスタンプ管理
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("DATETIME('now')");
                
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("DATETIME('now')");
            });
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is TaskItem && e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                ((TaskItem)entry.Entity).UpdatedAt = DateTime.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
} 