using System;

namespace TaskBoard.Api.Data;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsArchived { get; set; }
    public List<TaskItem> Tasks { get; set; } = new();
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
}
