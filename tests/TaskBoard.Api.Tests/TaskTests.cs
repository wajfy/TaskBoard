using System.Net;
using System.Net.Http.Json;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class TaskTests(ApiFactory factory)
{
    [Fact]
    public async Task Create_returns_201_with_location_and_starts_in_todo()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = "Nový úkol", description = "Popis" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var task = await response.Content.ReadFromJsonAsync<TaskItemDto>(Json.Options);
        Assert.Equal("Nový úkol", task!.Title);
        Assert.Equal("Popis", task.Description);
        Assert.Equal(TaskItemStatus.Todo, task.Status);
        Assert.Equal(project.Id, task.ProjectId);
        Assert.EndsWith($"/api/projects/{project.Id}/tasks/{task.Id}", response.Headers.Location!.AbsolutePath);
    }

    [Fact]
    public async Task Create_can_set_the_initial_status()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = "Rozdělaný", status = "InProgress" });

        var task = await response.Content.ReadFromJsonAsync<TaskItemDto>(Json.Options);
        Assert.Equal(TaskItemStatus.InProgress, task!.Status);
    }

    [Fact]
    public async Task List_returns_only_tasks_of_the_requested_project()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var first = await client.CreateProjectAsync("První");
        var second = await client.CreateProjectAsync("Druhý");
        var inFirst = await client.CreateTaskAsync(first.Id, "V prvním");
        await client.CreateTaskAsync(second.Id, "Ve druhém");

        var tasks = await client.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{first.Id}/tasks", Json.Options);

        Assert.Equal([inFirst.Id], tasks!.Select(t => t.Id));
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Task_is_not_reachable_through_another_project_of_the_same_user(string method)
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var home = await client.CreateProjectAsync("Domovský");
        var other = await client.CreateProjectAsync("Cizí");
        var task = await client.CreateTaskAsync(home.Id, "Patří domů");

        var request = new HttpRequestMessage(new HttpMethod(method), $"/api/projects/{other.Id}/tasks/{task.Id}");
        if (method == "PUT") request.Content = JsonContent.Create(new { title = "Přepsáno", status = "Done" });
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var stillThere = await client.GetFromJsonAsync<TaskItemDto>($"/api/projects/{home.Id}/tasks/{task.Id}", Json.Options);
        Assert.Equal("Patří domů", stillThere!.Title);
        Assert.Equal(TaskItemStatus.Todo, stillThere.Status);
    }

    [Fact]
    public async Task Update_changes_title_description_and_status()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var task = await client.CreateTaskAsync(project.Id, "Původní");

        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}/tasks/{task.Id}",
            new { title = "Nový název", description = "Nový popis", status = "Done" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var detail = await client.GetFromJsonAsync<TaskItemDto>($"/api/projects/{project.Id}/tasks/{task.Id}", Json.Options);
        Assert.Equal("Nový název", detail!.Title);
        Assert.Equal("Nový popis", detail.Description);
        Assert.Equal(TaskItemStatus.Done, detail.Status);
    }

    [Fact]
    public async Task Update_can_clear_the_description()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var created = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = "S popisem", description = "Popis" });
        var task = (await created.Content.ReadFromJsonAsync<TaskItemDto>(Json.Options))!;

        await client.PutAsJsonAsync($"/api/projects/{project.Id}/tasks/{task.Id}", new { title = "S popisem", status = "Todo", description = (string?)null });

        var detail = await client.GetFromJsonAsync<TaskItemDto>($"/api/projects/{project.Id}/tasks/{task.Id}", Json.Options);
        Assert.Null(detail!.Description);
    }

    [Fact]
    public async Task Status_is_serialized_as_a_string()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var task = await client.CreateTaskAsync(project.Id);
        await client.PutAsJsonAsync($"/api/projects/{project.Id}/tasks/{task.Id}", new { title = "Úkol", status = "InProgress" });

        var raw = await client.GetStringAsync($"/api/projects/{project.Id}/tasks/{task.Id}");

        Assert.Contains("\"status\":\"InProgress\"", raw);
    }

    [Fact]
    public async Task Update_with_unknown_status_returns_400_and_keeps_the_task()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var task = await client.CreateTaskAsync(project.Id, "Beze změny");

        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}/tasks/{task.Id}", new { title = "Změněno", status = "Neexistuje" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var detail = await client.GetFromJsonAsync<TaskItemDto>($"/api/projects/{project.Id}/tasks/{task.Id}", Json.Options);
        Assert.Equal("Beze změny", detail!.Title);
    }

    [Fact]
    public async Task Update_without_title_returns_400()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var task = await client.CreateTaskAsync(project.Id);

        var response = await client.PutAsJsonAsync($"/api/projects/{project.Id}/tasks/{task.Id}", new { title = "", status = "Todo" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_removes_the_task()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var task = await client.CreateTaskAsync(project.Id);

        var response = await client.DeleteAsync($"/api/projects/{project.Id}/tasks/{task.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var detail = await client.GetAsync($"/api/projects/{project.Id}/tasks/{task.Id}");
        var list = await client.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{project.Id}/tasks", Json.Options);
        Assert.Equal(HttpStatusCode.NotFound, detail.StatusCode);
        Assert.Empty(list!);
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Nonexistent_task_returns_404(string method)
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();
        var request = new HttpRequestMessage(new HttpMethod(method), $"/api/projects/{project.Id}/tasks/999999");
        if (method == "PUT") request.Content = JsonContent.Create(new { title = "Nikam", status = "Todo" });

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Creating_task_in_nonexistent_project_returns_404()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projects/999999/tasks", new { title = "Nikam" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Create_with_blank_title_returns_400(string title)
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_too_long_title_returns_400()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = new string('x', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_too_long_description_returns_400()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = "Úkol", description = new string('x', 501) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_title_and_description_of_maximum_length_is_accepted()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var project = await client.CreateProjectAsync();

        var response = await client.PostAsJsonAsync($"/api/projects/{project.Id}/tasks",
            new { title = new string('x', 200), description = new string('y', 500) });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
