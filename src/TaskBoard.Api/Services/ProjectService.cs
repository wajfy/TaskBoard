using Microsoft.EntityFrameworkCore;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<List<ProjectDto>> GetAllAsync()
    {
        return await db.Projects.AsNoTracking().Select(p => new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt)).ToListAsync();
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return project is null ? null : new ProjectDto(project.Id, project.Name, project.Description, project.CreatedAt);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        var entity = new Project { Name = dto.Name, Description = dto.Description };
        db.Projects.Add(entity);
        await db.SaveChangesAsync();
        return new ProjectDto(entity.Id, entity.Name, entity.Description, entity.CreatedAt);
    }

    public async Task<bool> UpdateAsync(int id, UpdateProjectDto dto)
    {
        var entity = await db.Projects.FindAsync(id);
        if (entity is null) return false;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await db.Projects.FindAsync(id);
        if (entity is null) return false;
        db.Projects.Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }
}