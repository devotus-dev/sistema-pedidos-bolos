import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC36-Ueup1X1vZDzo4WcANsbQeU15RjBPI",
  authDomain: "fornomagico2025.firebaseapp.com",
  projectId: "fornomagico2025",
  storageBucket: "fornomagico2025.appspot.com", // ✅ CORRIGIDO AQUI
  messagingSenderId: "724913845318",
  appId: "1:724913845318:web:7aad5a497cfb9a87ea4647",
  measurementId: "G-56B4HSZC4N"
};

// 🔥 Inicializa Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
