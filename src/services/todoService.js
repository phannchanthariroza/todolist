import { config, databases, ID } from './appwriteConfig';

export const getTodos = async () => {
  const response = await databases.listDocuments(config.db, config.col.todos);
  return response.documents;
};

export const addTodo = async (title) => {
  return databases.createDocument(config.db, config.col.todos, ID.unique(), {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });
};

export const toggleTodo = async (id, completed) => {
  return databases.updateDocument(config.db, config.col.todos, id, {
    completed: !completed,
  });
};

export const updateTodo = async (id, title) => {
  return databases.updateDocument(config.db, config.col.todos, id, { title });
};

export const removeTodo = async (id) => {
  return databases.deleteDocument(config.db, config.col.todos, id);
};
