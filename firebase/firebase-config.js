import admin from "firebase-admin"
import "dotenv/config";
admin.initializeApp({
  credential: process.env.FIREBASE_ADMIN_KEY,
  databaseURL: process.env.DATABASE_URL
});

export const db = admin.database();