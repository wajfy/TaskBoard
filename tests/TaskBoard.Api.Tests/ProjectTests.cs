using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class ProjectTests(ApiFactory factory)
{
    [Fact]
    public async Task Create_returns_201_with_location_and_the_new_project()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projects", new { name = "Nový projekt", description = "Popis" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var project = await response.Content.ReadFromJsonAsync<ProjectDto>(Json.Options);
        Assert.Equal("Nový projekt", project!.Name);
        Assert.Equal("Popis", project.Description);
        Assert.False(project.IsArchived);
        Assert.EndsWith($"/api/projects/{project.Id}", response.Headers.Location!.AbsolutePath);
    }

    [Fact]
    public async Task Created_project_is_in_my_list_and_can_be_fetched()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync("Viditelný");

        var list = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects", Json.Options);
        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);

        Assert.Contains(list!, p => p.Id == project.Id && p.Name == "Viditelný");
        Assert.Equal("Viditelný", detail!.Name);
    }

    [Fact]
    public async Task Update_changes_name_and_description()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync("Starý název");

        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "Nový název", description = "Nový popis" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        Assert.Equal("Nový název", detail!.Name);
        Assert.Equal("Nový popis", detail.Description);
    }

    [Fact]
    public async Task Update_can_clear_the_description()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var response = await client.PostAsJsonAsync("/api/projects", new { name = "S popisem", description = "Popis" });
        var project = (await response.Content.ReadFromJsonAsync<ProjectDto>(Json.Options))!;

        await client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "S popisem", description = (string?)null });

        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        Assert.Null(detail!.Description);
    }

    [Fact]
    public async Task Update_does_not_change_archived_state()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        await client.PostAsync($"/api/projects/{project.Id}/archive", null);

        await client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "Přejmenovaný" });

        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        Assert.True(detail!.IsArchived);
    }

    [Fact]
    public async Task Delete_removes_the_project()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.DeleteAsync($"/api/projects/{project.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var detail = await client.GetAsync($"/api/projects/{project.Id}");
        var list = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects", Json.Options);
        Assert.Equal(HttpStatusCode.NotFound, detail.StatusCode);
        Assert.DoesNotContain(list!, p => p.Id == project.Id);
    }

    [Theory]
    [InlineData("GET", "")]
    [InlineData("PUT", "")]
    [InlineData("DELETE", "")]
    [InlineData("POST", "/archive")]
    [InlineData("POST", "/unarchive")]
    public async Task Nonexistent_project_returns_404(string method, string suffix)
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var request = new HttpRequestMessage(new HttpMethod(method), $"/api/projects/999999{suffix}");
        if (method == "PUT") request.Content = JsonContent.Create(new { name = "Nikam" });

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Create_with_blank_name_returns_400(string name)
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projects", new { name });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_too_long_name_returns_400()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projects", new { name = new string('x', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_name_of_maximum_length_is_accepted()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projects", new { name = new string('x', 200) });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Update_with_blank_name_returns_400_and_keeps_the_old_name()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync("Původní");

        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        Assert.Equal("Původní", detail!.Name);
    }

    [Fact]
    public async Task Archived_project_leaves_the_active_list_and_appears_in_the_archive()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var archive = await client.PostAsync($"/api/projects/{project.Id}/archive", null);

        Assert.Equal(HttpStatusCode.NoContent, archive.StatusCode);
        var active = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects", Json.Options);
        var archived = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects?archived=true", Json.Options);
        Assert.DoesNotContain(active!, p => p.Id == project.Id);
        Assert.Contains(archived!, p => p.Id == project.Id && p.IsArchived);
    }

    [Fact]
    public async Task Active_project_is_not_in_the_archive()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var archived = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects?archived=true", Json.Options);

        Assert.DoesNotContain(archived!, p => p.Id == project.Id);
    }

    [Fact]
    public async Task Archived_project_can_still_be_opened_and_restored()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        await client.PostAsync($"/api/projects/{project.Id}/archive", null);

        var detail = await client.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        var restore = await client.PostAsync($"/api/projects/{project.Id}/unarchive", null);
        var active = await client.GetFromJsonAsync<List<ProjectDto>>("/api/projects", Json.Options);

        Assert.True(detail!.IsArchived);
        Assert.Equal(HttpStatusCode.NoContent, restore.StatusCode);
        Assert.Contains(active!, p => p.Id == project.Id && !p.IsArchived);
    }

    [Fact]
    public async Task Archiving_twice_is_not_an_error()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var first = await client.PostAsync($"/api/projects/{project.Id}/archive", null);
        var second = await client.PostAsync($"/api/projects/{project.Id}/archive", null);

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
    }

    [Fact]
    public async Task Archiving_keeps_the_tasks_of_the_project()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        await client.CreateTaskAsync(project.Id, "Zůstane");

        await client.PostAsync($"/api/projects/{project.Id}/archive", null);

        var tasks = await client.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{project.Id}/tasks", Json.Options);
        Assert.Single(tasks!);
    }

    [Fact]
    public async Task Deleting_project_also_deletes_its_tasks_in_the_database()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        await client.CreateTaskAsync(project.Id, "A");
        await client.CreateTaskAsync(project.Id, "B");
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(2, await db.Tasks.CountAsync(t => t.ProjectId == project.Id));

        var response = await client.DeleteAsync($"/api/projects/{project.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(0, await db.Tasks.AsNoTracking().CountAsync(t => t.ProjectId == project.Id));
    }

    [Fact]
    public async Task Deleting_project_does_not_touch_other_projects_tasks()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var doomed = await client.CreateProjectAsync("Smazaný");
        var survivor = await client.CreateProjectAsync("Přeživší");
        await client.CreateTaskAsync(doomed.Id);
        await client.CreateTaskAsync(survivor.Id, "Zůstane");

        await client.DeleteAsync($"/api/projects/{doomed.Id}");

        var tasks = await client.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{survivor.Id}/tasks", Json.Options);
        Assert.Single(tasks!);
    }
}
