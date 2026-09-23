using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskBoard.Api.Data;
using TaskBoard.Api.Services;
using System.Security.Claims;

namespace TaskBoard.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetAll()
    {
        return await projectService.GetAllAsync(CurrentUserId);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var project = await projectService.GetByIdAsync(CurrentUserId, id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectDto dto)
    {
        var project = await projectService.CreateAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProjectDto dto)
    {
        if (await projectService.UpdateAsync(CurrentUserId, id, dto))
            return NoContent();
        else
            return NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (await projectService.DeleteAsync(CurrentUserId, id))
            return NoContent();
        else
            return NotFound();
    }
}