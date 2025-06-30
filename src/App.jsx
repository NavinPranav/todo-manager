import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, RotateCcw, Calendar, Clock, Filter, SortAsc } from 'lucide-react';
import { useTodos } from './hooks/useTodos';

const App = () => {
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useTodos();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
    priority: 'medium'
  });

  const currentUser = { role: 'admin' };
  const userList = ['Alice', 'Bob', 'Charlie'];

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { label: 'No deadline', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600', bgColor: 'bg-red-50' };
    if (diffDays === 0) return { label: 'Due today', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (diffDays === 1) return { label: 'Due tomorrow', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: `Due in ${diffDays} days`, color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const getTodoStatus = (todo) => {
    if (todo.status === 'completed') 
      return 'completed';
    // if (!todo.deadline) return 'active';
    const today = new Date();
    const deadlineDate = new Date(todo.deadline);
    if (deadlineDate < today) return 'overdue';
    return 'in_progress';
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      const status = getTodoStatus(todo);
      if (filter === 'all') return true;
      return status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          return getTodoStatus(a).localeCompare(getTodoStatus(b));
        default:
          return 0;
      }
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          deadline: formData.deadline || null,
          assignedTo: formData.assignedTo || null,
          priority: formData.priority || 'medium'
        });
        setEditingTodo(null);
        setShowForm(false);
      } else {
        await addTodo({
          title: formData.title.trim(),
          description: formData.description.trim(),
          dueDate: formData.deadline || null,
          assignedTo: formData.assignedTo || null,
          priority: formData.priority || 'medium'
        });
      }

      setFormData({ title: '', description: '', deadline: '', assignedTo: '', priority: 'medium' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      deadline: todo.deadline || '',
      assignedTo: todo.assignedTo || '',
      priority: todo.priority || 'medium'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleToggleComplete = async (id, status) => {
    try {
      await toggleTodo(id, status);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const getStatusCounts = () => {
    const counts = { all: todos.length, active: 0, completed: 0, overdue: 0 };
    todos.forEach(todo => {
      const status = getTodoStatus(todo);
      counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo Manager</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
            <p className="text-red-500 text-sm mt-1">
              Make sure the JSON server is running on port 3001
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', label: 'Total', color: 'bg-blue-500' },
            { key: 'active', label: 'Active', color: 'bg-green-500' },
            { key: 'completed', label: 'Completed', color: 'bg-purple-500' },
            { key: 'overdue', label: 'Overdue', color: 'bg-red-500' }
          ].map(stat => (
            <div key={stat.key} className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className={`w-8 h-8 ${stat.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                {statusCounts[stat.key]}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingTodo(null);
                setFormData({ title: '', description: '', deadline: '', assignedTo: '', priority: 'medium' });
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add New Todo
            </button>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Todos</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deadline">By Deadline</option>
                  <option value="created">By Created Date</option>
                  <option value="status">By Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {editingTodo ? 'Edit Todo' : 'Create New Todo'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter todo title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Add description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-4">
                    {['low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={formData.priority === level}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        />
                        <span className="capitalize text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                    disabled={loading}
                  >
                    {editingTodo ? 'Update Todo' : 'Create Todo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTodo(null);
                      setFormData({ title: '', description: '', deadline: '', assignedTo: '', priority: 'medium' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-500 mb-2">No todos found</h3>
              <p className="text-gray-400">
                {filter === 'all' ? 'Create your first todo to get started!' : `No ${filter} todos at the moment.`}
              </p>
            </div>
          ) : (
            filteredAndSortedTodos.map(todo => {
              const status = getTodoStatus(todo);
              const deadlineInfo = getDeadlineStatus(todo.deadline);
              
              return (
                <div
                  key={todo.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${
                    status === 'completed' ? 'border-green-500 opacity-75' :
                    status === 'overdue' ? 'border-red-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}>
                          {todo.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      
                      {todo.description && (
                        <p className={`text-gray-600 mb-3 ${
                          status === 'completed' ? 'line-through' : ''
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        {todo.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">
                              {new Date(todo.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${deadlineInfo.bgColor} ${deadlineInfo.color}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {deadlineInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleComplete(todo.id, todo.status === 'completed' ? 'in_progress' : 'completed')}
                        className={`p-2 rounded-lg transition-colors ${
                          status === 'completed'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={status === 'completed' ? 'Mark as active' : 'Mark as completed'}
                        disabled={loading}
                      >
                        {status === 'completed' ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit todo"
                        disabled={loading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete todo"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default App;