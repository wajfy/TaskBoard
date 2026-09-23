using Microsoft.EntityFrameworkCore;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<List<ProjectDto>> GetAllAsync(string userId)
    {
        return await db.Projects.AsNoTracking().Where(p => p.UserId == userId).Select(p => new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt)).ToListAsync();
    }

    public async Task<ProjectDto?> GetByIdAsync(string userId,int id)
    {
        var project = await db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        return project is null ? null : new ProjectDto(project.Id, project.Name, project.Description, project.CreatedAt);
    }

    public async Task<ProjectDto> CreateAsync(string userId, CreateProjectDto dto)
    {
        var entity = new Project { Name = dto.Name, Description = dto.Description, UserId = userId };
        db.Projects.Add(entity);
        await db.SaveChangesAsync();
        return new ProjectDto(entity.Id, entity.Name, entity.Description, entity.CreatedAt);
    }

    public async Task<bool> UpdateAsync(string userId, int id, UpdateProjectDto dto)
    {
        var entity = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (entity is null) return false;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(string userId,int id)
    {
        var entity = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (entity is null) return false;
        db.Projects.Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }
}