using System.Net.Http.Json;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

public static class TestData
{
    public static async Task<ProjectDto> CreateProjectAsync(this HttpClient client, string name = "Projekt")
    {
        var response = await client.PostAsJsonAsync("/api/projects", new { name });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ProjectDto>(Json.Options))!;
    }

    public static async Task<TaskItemDto> CreateTaskAsync(this HttpClient client, int projectId, string title = "Úkol")
    {
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/tasks", new { title });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<TaskItemDto>(Json.Options))!;
    }
}