const API_BASE_URL = 'http://localhost:3001';

class TodoService {
  async getAllTodos() {
    try {
      const response = await fetch(`https://todo-manager-api-production.up.railway.app/api/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  async createTodo(todoData) {
    try {
      const response = await fetch(`https://todo-manager-api-production.up.railway.app/api/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todoData,
          createdAt: new Date().toISOString(),
          completed: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create todo');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  async updateTodo(id, updates) {
    try {
      const response = await fetch(`https://todo-manager-api-production.up.railway.app/api/update?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      const response = await fetch(`https://todo-manager-api-production.up.railway.app/api/update-status?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"status": status}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async deleteTodo(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}

export const todoService = new TodoService();