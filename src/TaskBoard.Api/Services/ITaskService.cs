using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public interface ITaskService
{
    Task<List<TaskItemDto>> GetAllAsync(int projectId);
    Task<TaskItemDto?> GetByIdAsync(int projectId, int id);
    Task<TaskItemDto?> CreateAsync(int projectId, CreateTaskItemDto dto);
    Task<bool> UpdateAsync(int projectId, int id, UpdateTaskItemDto dto);
    Task<bool> DeleteAsync(int projectId, int id);
}