import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./components/Login";
import CadastroUsuario from "./components/CadastroUsuario";
import PedidoCliente from "./components/PedidoCliente";
import HomePublica from "./components/HomePublica";
import PainelAdmin from "./components/PainelAdmin";

import logo from "./assets/logo.jpg";

import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return <div className="text-center mt-20">Carregando...</div>;
  }

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* 🏠 Público */}
        <Route path="/" element={<HomePublica logo={logo} />} />
        <Route path="/pedido" element={<PedidoCliente />} />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/admin/dashboard" />}
        />
        <Route
          path="/cadastro"
          element={!user ? <CadastroUsuario /> : <Navigate to="/admin/dashboard" />}
        />

        {/* 🔒 Privado */}
        <Route
          path="/admin/*"
          element={
            user ? (
              <PainelAdmin onLogout={() => signOut(auth)} logo={logo} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 🔀 Se não encontrado */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
