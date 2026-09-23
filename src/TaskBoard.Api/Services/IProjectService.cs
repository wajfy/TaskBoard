using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetAllAsync(string userId);
    Task<ProjectDto?> GetByIdAsync(string userId, int id);
    Task<ProjectDto> CreateAsync(string userId, CreateProjectDto dto);
    Task<bool> UpdateAsync(string userId, int id, UpdateProjectDto dto);
    Task<bool> DeleteAsync(string userId, int id);
}