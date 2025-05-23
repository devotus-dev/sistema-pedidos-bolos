import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.jpg"; // Ajuste seu caminho conforme sua pasta

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      toast.success("Login efetuado com sucesso!");
      navigate("/admin/dashboard"); // ✅ Leva diretamente para o dashboard após login
    } catch (error) {
      toast.error("Erro no login: " + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <img
        src={logo}
        alt="Logo da empresa"
        className="w-24 h-24 rounded-full shadow mb-6 border-4 border-pink-300"
      />
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full p-6 bg-white rounded shadow"
      >
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="mt-4 text-center">
          Não tem uma conta?{" "}
          <Link to="/cadastro" className="text-pink-600 hover:underline">
            Cadastre-se aqui
          </Link>
        </p>
      </form>
    </div>
  );
}
