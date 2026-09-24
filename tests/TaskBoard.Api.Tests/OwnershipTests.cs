using System.Net;
using System.Net.Http.Json;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class OwnershipTests(ApiFactory factory)
{
    [Fact]
    public async Task Projects_of_another_user_are_not_in_my_list()
    {
        var owner = await factory.CreateAuthenticatedClientAsync();
        var intruder = await factory.CreateAuthenticatedClientAsync();
        await owner.CreateProjectAsync("Můj projekt");

        var projects = await intruder.GetFromJsonAsync<List<ProjectDto>>("/api/projects", Json.Options);

        Assert.Empty(projects!);
    }

    [Theory]
    [InlineData("GET", "")]
    [InlineData("PUT", "")]
    [InlineData("DELETE", "")]
    [InlineData("POST", "/archive")]
    [InlineData("POST", "/unarchive")]
    public async Task Another_user_gets_404_on_my_project_and_it_stays_untouched(string method, string suffix)
    {
        var owner = await factory.CreateAuthenticatedClientAsync();
        var intruder = await factory.CreateAuthenticatedClientAsync();
        var project = await owner.CreateProjectAsync("Tajný projekt");

        var request = new HttpRequestMessage(new HttpMethod(method), $"/api/projects/{project.Id}{suffix}");
        if (method == "PUT") request.Content = JsonContent.Create(new { name = "Přepsáno" });
        var response = await intruder.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var stillThere = await owner.GetFromJsonAsync<ProjectDto>($"/api/projects/{project.Id}", Json.Options);
        Assert.Equal("Tajný projekt", stillThere!.Name);
        Assert.False(stillThere.IsArchived);
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Another_user_gets_404_on_task_in_my_project_and_it_stays_untouched(string method)
    {
        var owner = await factory.CreateAuthenticatedClientAsync();
        var intruder = await factory.CreateAuthenticatedClientAsync();
        var project = await owner.CreateProjectAsync();
        var task = await owner.CreateTaskAsync(project.Id, "Tajný úkol");

        var request = new HttpRequestMessage(new HttpMethod(method), $"/api/projects/{project.Id}/tasks/{task.Id}");
        if (method == "PUT") request.Content = JsonContent.Create(new { title = "Přepsáno", status = "Done" });
        var response = await intruder.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var stillThere = await owner.GetFromJsonAsync<TaskItemDto>($"/api/projects/{project.Id}/tasks/{task.Id}", Json.Options);
        Assert.Equal("Tajný úkol", stillThere!.Title);
        Assert.Equal(TaskItemStatus.Todo, stillThere.Status);
    }

    [Fact]
    public async Task Another_user_cannot_create_task_in_my_project()
    {
        var owner = await factory.CreateAuthenticatedClientAsync();
        var intruder = await factory.CreateAuthenticatedClientAsync();
        var project = await owner.CreateProjectAsync();

        var response = await intruder.PostAsJsonAsync($"/api/projects/{project.Id}/tasks", new { title = "Podvržený úkol" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var tasks = await owner.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{project.Id}/tasks", Json.Options);
        Assert.Empty(tasks!);
    }

    [Fact]
    public async Task Another_user_sees_no_tasks_of_my_project()
    {
        var owner = await factory.CreateAuthenticatedClientAsync();
        var intruder = await factory.CreateAuthenticatedClientAsync();
        var project = await owner.CreateProjectAsync();
        await owner.CreateTaskAsync(project.Id);

        var tasks = await intruder.GetFromJsonAsync<List<TaskItemDto>>($"/api/projects/{project.Id}/tasks", Json.Options);

        Assert.Empty(tasks!);
    }
}
