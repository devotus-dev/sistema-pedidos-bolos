import React, { useState } from "react";
import Dashboard from "./Dashboard";
import ListaPedidos from "./ListaPedidos";
import CadastroItens from "./CadastroItens";
import Promocoes from "./Promocoes";

export default function PainelAdmin({ onLogout, logo }) {
  const [pagina, setPagina] = useState("dashboard");

  function renderPagina() {
    switch (pagina) {
      case "dashboard":
        return <Dashboard />;
      case "pedidos":
        return <ListaPedidos />;
      case "itens":
        return <CadastroItens />;
      case "promocoes":
        return <Promocoes />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex w-56 bg-pink-700 text-white flex-col">
        <div className="flex items-center justify-center p-4 border-b border-pink-600">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-full" />
          <h1 className="ml-3 font-bold text-lg">Forno Encantado</h1>
        </div>

        {[
          { key: "dashboard", label: "Dashboard" },
          { key: "pedidos", label: "Lista de Pedidos" },
          { key: "itens", label: "Cadastro de Itens" },
          { key: "promocoes", label: "Promoções" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setPagina(item.key)}
            className={`p-4 hover:bg-pink-600 ${
              pagina === item.key ? "bg-pink-800" : ""
            }`}
          >
            {item.label}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="mt-auto p-4 bg-red-600 hover:bg-red-700"
        >
          Sair
        </button>
      </nav>

      {/* Navbar Mobile */}
      <div className="md:hidden bg-pink-700 text-white flex flex-wrap justify-center gap-2 p-2">
        {[
          { key: "dashboard", label: "Dashboard" },
          { key: "pedidos", label: "Pedidos" },
          { key: "itens", label: "Itens" },
          { key: "promocoes", label: "Promoções" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setPagina(item.key)}
            className={`px-3 py-2 rounded ${
              pagina === item.key ? "bg-pink-800" : "hover:bg-pink-600"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      {/* Conteúdo */}
      <main className="flex-1 p-4 bg-gray-50 overflow-auto">
        {renderPagina()}
      </main>
    </div>
  );
}
