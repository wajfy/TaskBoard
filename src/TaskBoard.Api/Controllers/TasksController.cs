using Microsoft.AspNetCore.Mvc;
using TaskBoard.Api.Data;
using TaskBoard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace TaskBoard.Api.Controllers;

[Route("api/projects/{projectId}/[controller]")]
[ApiController]
[Authorize]
public class TasksController(ITaskService taskService) : ControllerBase
{
    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<TaskItemDto>>> GetAll(int projectId)
    {
        return await taskService.GetAllAsync(CurrentUserId, projectId);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDto>> GetById(int projectId, int id)
    {
        var task = await taskService.GetByIdAsync(CurrentUserId, projectId, id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create(int projectId, CreateTaskItemDto dto)
    {
        var task = await taskService.CreateAsync(CurrentUserId, projectId, dto);
        if (task is null)
            return NotFound($"Projekt s ID {projectId} neexistuje.");

        return CreatedAtAction(nameof(GetById), new { projectId, id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int projectId, int id, UpdateTaskItemDto dto)
    {
        if (await taskService.UpdateAsync(CurrentUserId, projectId, id, dto))
            return NoContent();
        else
            return NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int projectId, int id)
    {
        if (await taskService.DeleteAsync(CurrentUserId, projectId, id))
            return NoContent();
        else
            return NotFound();
    }
}