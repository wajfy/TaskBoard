using Microsoft.AspNetCore.Mvc;
using TaskBoard.Api.Data;
using TaskBoard.Api.Services;

namespace TaskBoard.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController(IProjectService projectService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<ProjectDto>>> GetAll()
        {
            return await projectService.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetById(int id)
        {
            var project = await projectService.GetByIdAsync(id);
            return project is null ? NotFound() : Ok(project);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectDto>> Create(CreateProjectDto dto)
        {
            var project = await projectService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateProjectDto dto)
        {
            if (await projectService.UpdateAsync(id, dto))
                return NoContent();
            else
                return NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (await projectService.DeleteAsync(id))
                return NoContent();
            else
                return NotFound();
        }
    }
}
