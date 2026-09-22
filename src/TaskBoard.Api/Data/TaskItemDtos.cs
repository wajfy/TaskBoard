using System.ComponentModel.DataAnnotations;

namespace TaskBoard.Api.Data;

public record CreateTaskItemDto([Required, MaxLength(200)] string Title, [MaxLength(500)] string? Description, TaskItemStatus Status = TaskItemStatus.Todo);

public record UpdateTaskItemDto([Required, MaxLength(200)] string Title, [MaxLength(500)] string? Description, TaskItemStatus Status);

public record TaskItemDto(int Id, string Title, string? Description, TaskItemStatus Status, DateTimeOffset CreatedAt, int ProjectId);