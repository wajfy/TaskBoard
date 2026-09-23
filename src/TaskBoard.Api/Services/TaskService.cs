using Microsoft.EntityFrameworkCore;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public class TaskService(AppDbContext db) : ITaskService
{
    public async Task<List<TaskItemDto>> GetAllAsync(string userId, int projectId)
    {
        return await db.Tasks
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId && t.Project.UserId == userId)
            .Select(t => new TaskItemDto(t.Id, t.Title, t.Description, t.Status, t.CreatedAt, t.ProjectId))
            .ToListAsync();
    }

    public async Task<TaskItemDto?> GetByIdAsync(string userId, int projectId, int id)
    {
        var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId && t.Project.UserId == userId);
        return task is null ? null : new TaskItemDto(task.Id, task.Title, task.Description, task.Status, task.CreatedAt, task.ProjectId);
    }

    public async Task<TaskItemDto?> CreateAsync(string userId, int projectId, CreateTaskItemDto dto)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId && p.UserId == userId))
            return null;

        var entity = new TaskItem { Title = dto.Title, Description = dto.Description, Status = dto.Status, ProjectId = projectId };
        db.Tasks.Add(entity);
        await db.SaveChangesAsync();
        return new TaskItemDto(entity.Id, entity.Title, entity.Description, entity.Status, entity.CreatedAt, entity.ProjectId);
    }

    public async Task<bool> UpdateAsync(string userId, int projectId, int id, UpdateTaskItemDto dto)
    {
        var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId && t.Project.UserId == userId);
        if (entity is null) return false;

        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.Status = dto.Status;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(string userId, int projectId, int id)
    {
        var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId && t.Project.UserId == userId);
        if (entity is null) return false;

        db.Tasks.Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }
}
