// 🔥 Importações do Firebase necessárias
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC36-Ueup1X1vZDzo4WcANsbQeU15RjBPI",
  authDomain: "fornomagico2025.firebaseapp.com",
  projectId: "fornomagico2025",
  storageBucket: "fornomagico2025.appspot.com", // ✔️ Corrigido
  messagingSenderId: "724913845318",
  appId: "1:724913845318:web:7aad5a497cfb9a87ea4647",
};

// 🔥 Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Exporta Firestore e Auth para uso na aplicação
export const db = getFirestore(app);
export const auth = getAuth(app); // ✔️ Exporta Auth pra login/autenticação

// ✔️ Exporta o app caso precise usar
export default app;
