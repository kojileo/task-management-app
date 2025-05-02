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
                    .HasMaxLength(500)
                    .IsRequired(false);
                
                entity.Property(e => e.AssignedTo)
                    .IsRequired()
                    .HasMaxLength(50);

                // SQLiteでのタイムスタンプ管理
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("DATETIME('now')");
                
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("DATETIME('now')");

                // 必須フィールドのバリデーション
                entity.Property(e => e.Status)
                    .IsRequired();

                entity.Property(e => e.DueDate)
                    .IsRequired();
            });
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is TaskItem && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                var task = (TaskItem)entry.Entity;

                // バリデーション
                if (string.IsNullOrWhiteSpace(task.Title))
                {
                    throw new DbUpdateException("Title is required and cannot be empty.");
                }

                if (string.IsNullOrWhiteSpace(task.AssignedTo))
                {
                    throw new DbUpdateException("AssignedTo is required and cannot be empty.");
                }

                if (task.Title.Length > 100)
                {
                    throw new DbUpdateException("Title cannot exceed 100 characters.");
                }

                if (task.AssignedTo.Length > 50)
                {
                    throw new DbUpdateException("AssignedTo cannot exceed 50 characters.");
                }

                if (task.Description?.Length > 500)
                {
                    throw new DbUpdateException("Description cannot exceed 500 characters.");
                }

                // 更新日時の設定
                if (entry.State == EntityState.Modified)
                {
                    task.UpdatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
} 