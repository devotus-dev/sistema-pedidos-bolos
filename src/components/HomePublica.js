import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

function HomePublica() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 px-4 text-center">
      <img
        src={logo}
        alt="Logo Forno Encantado"
        className="w-32 h-32 rounded-full shadow mb-6 border-4 border-pink-300"
      />
      <h1 className="text-4xl font-extrabold mb-6 text-pink-700">
        Bem-vindo ao Forno Encantado!
      </h1>
      <p className="mb-8 max-w-xl text-gray-700">
        Faça seu pedido de bolo caseiro de forma rápida e prática. Clique no
        botão abaixo para começar.
      </p>
      <button
        onClick={() => navigate("/pedido")}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded transition"
      >
        Fazer Pedido Agora
      </button>
    </div>
  );
}

export default HomePublica;
