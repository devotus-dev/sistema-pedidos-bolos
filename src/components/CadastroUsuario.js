import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

const emailsPermitidos = [
  "italofreitas0711@gmail.com",
  "lauanelinda456@gmail.com",
];

export default function CadastroUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    if (!emailsPermitidos.includes(email)) {
      toast.error("Email não autorizado para cadastro.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      toast.success("Usuário cadastrado com sucesso!");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      toast.error("Erro no cadastro: " + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <img
        src={logo}
        alt="Logo"
        className="w-24 h-24 rounded-full shadow mb-6 border-4 border-pink-300"
      />
      <form
        onSubmit={handleCadastro}
        className="max-w-md w-full p-6 bg-white rounded shadow"
      >
        <h2 className="text-2xl mb-4 text-center">Cadastro de Usuário</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
        <p className="mt-4 text-center">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-pink-600 hover:underline">
            Faça login aqui
          </Link>
        </p>
      </form>
    </div>
  );
}
