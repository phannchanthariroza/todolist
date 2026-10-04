import 'react-native-url-polyfill/auto';
import { Client, Databases, ID } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;

export const config = {
  db: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  col: {
    todos: process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID,
  },
};

export { ID };
