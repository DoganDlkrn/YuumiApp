// Firebase konfigürasyon dosyası
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase konfigürasyonu - API key'i tırnak içinde doğru formatta yazalım
const firebaseConfig = {
  apiKey: "AIzaSyBzNJUPs-h1VxX4wWlM0SeWgQTZqjx9W0E", // API key'in tırnak içinde olduğundan emin olalım
  authDomain: "yuumi-4606b.firebaseapp.com",
  projectId: "yuumi-4606b",
  storageBucket: "yuumi-4606b.appspot.com",
  messagingSenderId: "156043387950",
  appId: "1:156043387950:ios:360e8ab3c220ef0bdc2bbf"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 