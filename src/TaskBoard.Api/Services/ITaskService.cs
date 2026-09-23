using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public interface ITaskService
{
    Task<List<TaskItemDto>> GetAllAsync(string userId, int projectId);
    Task<TaskItemDto?> GetByIdAsync(string userId, int projectId, int id);
    Task<TaskItemDto?> CreateAsync(string userId, int projectId, CreateTaskItemDto dto);
    Task<bool> UpdateAsync(string userId, int projectId, int id, UpdateTaskItemDto dto);
    Task<bool> DeleteAsync(string userId, int projectId, int id);
}