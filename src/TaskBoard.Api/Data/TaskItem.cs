namespace TaskBoard.Api.Data;

public enum TaskItemStatus
{
    Todo,
    InProgress,
    Done,
}

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}