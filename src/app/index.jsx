import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addTodo, getTodos, removeTodo, toggleTodo, updateTodo } from '../services/todoService';

const Index = () => {
  const [todoList, setTodoList] = useState([]);
  const [todo, setTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [lastUpdatedId, setLastUpdatedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setTodoList(await getTodos());
    } catch (loadError) {
      console.error('Error loading items:', loadError);
      setError('Could not connect to your Focus Board. Check Appwrite and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadTodos();
  }, [loadTodos]));

  const handleAdd = async () => {
    const title = todo.trim();
    if (!title || isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      const createdTodo = await addTodo(title);
      setTodoList((currentTodos) => [createdTodo, ...currentTodos]);
      setTodo('');
    } catch (saveError) {
      console.error('Error adding item:', saveError);
      setError('Could not save that item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (id) => {
    setDeletingId(id);
  };

  const deleteItem = async (id) => {
    try {
      await removeTodo(id);
      setTodoList((currentTodos) => currentTodos.filter((item) => item.$id !== id));
      setDeletingId(null);
    } catch (deleteError) {
      console.error('Error deleting item:', deleteError);
      setError('Could not delete that item.');
    }
  };

  const handleToggle = async (item) => {
    try {
      const updatedTodo = await toggleTodo(item.$id, item.completed);
      setTodoList((currentTodos) => currentTodos.map((currentItem) => (
        currentItem.$id === item.$id ? updatedTodo : currentItem
      )));
    } catch (updateError) {
      console.error('Error updating item:', updateError);
      setError('Could not update that item.');
    }
  };

  const openEditor = (item) => {
    setEditingItem(item);
    setEditingTitle(item.title);
    setError('');
  };

  const closeEditor = () => {
    if (!isSaving) setEditingItem(null);
  };

  const handleEditSave = async () => {
    const trimmedTitle = editingTitle.trim();
    if (!editingItem || !trimmedTitle || isSaving) return;

    setIsSaving(true);
    try {
      const updatedItem = await updateTodo(editingItem.$id, trimmedTitle);
      setTodoList((currentTodos) => currentTodos.map((item) => (
        item.$id === updatedItem.$id ? updatedItem : item
      )));
      setLastUpdatedId(updatedItem.$id);
      setEditingItem(null);
    } catch (updateError) {
      console.error('Error editing item:', updateError);
      setError('Could not update that item.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable style={styles.todoContent} onPress={() => handleToggle(item)}>
        <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.todoText, item.completed && styles.completedText]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.$id === lastUpdatedId && <Text style={styles.updatedText}>Updated</Text>}
        </View>
      </Pressable>
      <View style={styles.actionButtons}>
        <Pressable onPress={() => openEditor(item)} style={styles.actionButton}>
          <Text style={styles.editText}>Open</Text>
        </Pressable>
        <Pressable onPress={() => handleRemove(item.$id)} style={styles.actionButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus Board</Text>
        <Text style={styles.headerSubtitle}>Keep the next important things in view</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a focus item..."
          placeholderTextColor="#888"
          value={todo}
          onChangeText={setTodo}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable onPress={handleAdd} style={styles.addButton} disabled={isSaving}>
          <Text style={styles.addButtonText}>{isSaving ? '...' : 'Add'}</Text>
        </Pressable>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {isLoading ? <ActivityIndicator style={styles.loader} size="large" color="#e05a33" /> : (
        <FlatList
          data={todoList}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Your board is clear. Add a focus item above.</Text>}
        />
      )}
      <Modal visible={!!editingItem} transparent animationType="fade" onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update focus item</Text>
            <TextInput
              style={styles.modalInput}
              value={editingTitle}
              onChangeText={setEditingTitle}
              autoFocus
              placeholder="Focus item"
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeEditor} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleEditSave} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={!!deletingId} transparent animationType="fade" onRequestClose={() => setDeletingId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete focus item?</Text>
            <Text style={styles.modalMessage}>This item will be permanently removed.</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setDeletingId(null)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => deleteItem(deletingId)} style={[styles.modalButton, styles.deleteButton]}>
                <Text style={styles.saveText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#172026' },
  headerSubtitle: { color: '#66747a', marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  input: { flex: 1, fontSize: 18, padding: 10, color: '#172026' },
  addButton: { backgroundColor: '#e05a33', padding: 10, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  todoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  todoContent: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  itemTextContainer: { flex: 1, minWidth: 0 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#e05a33', borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: '#e05a33' },
  checkmark: { color: '#fff', fontWeight: '700' },
  todoText: { flex: 1, fontSize: 18, color: '#172026' },
  updatedText: { fontSize: 12, color: '#e05a33', marginTop: 3 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  actionButton: { padding: 6 },
  editText: { color: '#2463eb', fontWeight: '600' },
  deleteText: { color: '#d92d20', fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#9a9a9a' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  loader: { marginTop: 48 },
  errorText: { color: '#b42318', marginHorizontal: 20, marginBottom: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(23, 32, 38, 0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#172026', marginBottom: 16 },
  modalMessage: { color: '#66747a', fontSize: 15, marginBottom: 4 },
  modalInput: { backgroundColor: '#f8f9fb', borderColor: '#d0d5dd', borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalButton: { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  cancelButton: { backgroundColor: '#eaecf0' },
  saveButton: { backgroundColor: '#e05a33' },
  deleteButton: { backgroundColor: '#d92d20' },
  cancelText: { color: '#344054', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
});