import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTodos, updateTodo } from '../../services/todoService';

export default function TodoEditor() {
  const { id } = useLocalSearchParams();
  const todoId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [todo, setTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTodo = async () => {
      const todos = await getTodos();
      const matchingTodo = todos.find((item) => item.$id === todoId);
      if (matchingTodo) {
        setTodo(matchingTodo);
        setTitle(matchingTodo.title);
      }
      setIsLoading(false);
    };

    loadTodo().catch((error) => {
      console.error('Error loading item:', error);
      setIsLoading(false);
    });
  }, [todoId]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!todo || !trimmedTitle || isSaving) return;
    setIsSaving(true);
    try {
      await updateTodo(todo.$id, trimmedTitle);
      router.back();
    } catch (error) {
      console.error('Error updating item:', error);
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Refine focus item</Text>
      {isLoading ? <ActivityIndicator size="large" color="#e05a33" /> : (
        <>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Focus item" autoFocus />
          <View style={styles.actions}>
            <Pressable onPress={() => router.back()} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb', padding: 20 },
  heading: { fontSize: 26, fontWeight: '700', color: '#172026', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderColor: '#d0d5dd', borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  button: { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  cancelButton: { backgroundColor: '#eaecf0' },
  saveButton: { backgroundColor: '#e05a33' },
  cancelText: { color: '#344054', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
});