import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];


const statusOptions = [
  { value: "", label: "Todos" },
  { value: "Aguardando", label: "Aguardando" },
  { value: "Produzindo", label: "Produzindo" },
  { value: "Pronto", label: "Pronto" },
  { value: "Saiu para entrega", label: "Saiu para entrega" },
  { value: "Entregue", label: "Entregue" },
];

const pagamentoOptions = [
  { value: "", label: "Todos" },
  { value: "Pendente", label: "Pendente" },
  { value: "Pago", label: "Pago" },
];

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [pagamentoFiltro, setPagamentoFiltro] = useState("");
  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
  const [modalOpen, setModalOpen] = useState(false);
  const [idExcluir, setIdExcluir] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPedidos(lista);
    });
    return () => unsubscribe();
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    const nomeOk = p.nome?.toLowerCase().includes(busca.toLowerCase());
    const statusOk = statusFiltro === "" || p.status === statusFiltro;
    const pagamentoOk =
      pagamentoFiltro === "" || p.pagamento === pagamentoFiltro;

    const data = p.dataEntrega;
    const dataOk =
      (!dataInicial || data >= dataInicial) &&
      (!dataFinal || data <= dataFinal);

    return nomeOk && statusOk && pagamentoOk && dataOk;
  });

  async function atualizarStatus(id, novoValor, campo) {
    try {
      const pedidoRef = doc(db, "pedidos", id);
      await updateDoc(pedidoRef, { [campo]: novoValor });

      toast.success(`${campo === "dataEntrega" ? "Data" : campo} atualizado!`);

      if (campo === "status" && novoValor === "Saiu para entrega") {
        const pedido = pedidos.find((p) => p.id === id);
        if (pedido?.telefone) {
          const mensagem = `Olá ${pedido.nome}, seu pedido está a caminho! 🚚🍰\nFique atento, logo ele chegará até você!`;
          const linkWhatsapp = `https://wa.me/55${pedido.telefone.replace(
            /\D/g,
            ""
          )}?text=${encodeURIComponent(mensagem)}`;
          window.open(linkWhatsapp, "_blank");
        }
      }
    } catch (error) {
      toast.error(`Erro ao atualizar ${campo}`);
    }
  }

  async function excluirPedido(id) {
    try {
      await deleteDoc(doc(db, "pedidos", id));
      toast.success("Pedido excluído!");
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir pedido!");
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-2">
      <h2 className="text-2xl font-bold mb-4 text-pink-700">
        Lista de Pedidos
      </h2>

      {/* 🔍 Filtros */}
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4">
        <div>
          <label className="text-sm block mb-1">Buscar por nome</label>
          <input
            type="text"
            placeholder="Digite o nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border rounded px-3 py-2 w-[180px]"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Data Inicial</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Data Final</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Pagamento</label>
          <select
            value={pagamentoFiltro}
            onChange={(e) => setPagamentoFiltro(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          >
            {pagamentoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🖥️ Tabela Desktop */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-center table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th>Cliente</th>
              <th>Sabor</th>
              <th>Data Entrega</th>
              <th>Valor (R$)</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-gray-400">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
            {pedidosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.itens?.map((i) => i.nome).join(", ") || "-"}</td>
                <td>
                  <input
                    type="date"
                    value={p.dataEntrega || ""}
                    onChange={(e) =>
                      atualizarStatus(p.id, e.target.value, "dataEntrega")
                    }
                    className="border rounded px-2 py-1 w-[150px] text-black"
                  />
                </td>
                <td>R$ {p.valor?.toFixed(2) || "0.00"}</td>
                <td>
                  <select
                    value={p.status || ""}
                    onChange={(e) =>
                      atualizarStatus(p.id, e.target.value, "status")
                    }
                    className={`border rounded px-3 py-1 ${
                      p.status === "Entregue"
                        ? "bg-purple-100 text-purple-800"
                        : p.status === "Pronto"
                        ? "bg-pink-100 text-pink-700"
                        : p.status === "Produzindo"
                        ? "bg-blue-100 text-blue-800"
                        : p.status === "Saiu para entrega"
                        ? "bg-orange-100 text-orange-800"
                        : p.status === "Aguardando"
                        ? "bg-gray-100 text-gray-700"
                        : ""
                    }`}
                  >
                    {statusOptions
                      .filter((opt) => opt.value !== "")
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <select
                    value={p.pagamento || ""}
                    onChange={(e) =>
                      atualizarStatus(p.id, e.target.value, "pagamento")
                    }
                    className={`border rounded px-3 py-1 ${
                      p.pagamento === "Pago"
                        ? "bg-green-100 text-green-800"
                        : p.pagamento === "Pendente"
                        ? "bg-red-100 text-red-800"
                        : ""
                    }`}
                  >
                    {pagamentoOptions
                      .filter((opt) => opt.value !== "")
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </td>
                <td>{p.observacoes || "-"}</td>
                <td>
                  <button
                    onClick={() => {
                      setIdExcluir(p.id);
                      setModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Cards */}
      <div className="md:hidden space-y-4">
        {pedidosFiltrados.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg shadow-md p-5 border space-y-3"
          >
            <p>
              <strong>Cliente:</strong> {p.nome}
            </p>
            <p>
              <strong>Sabor:</strong>{" "}
              {p.itens?.map((i) => i.nome).join(", ") || "-"}
            </p>
            <div>
              <label className="text-sm block mb-1">Data de Entrega</label>
              <input
                type="date"
                value={p.dataEntrega || ""}
                onChange={(e) =>
                  atualizarStatus(p.id, e.target.value, "dataEntrega")
                }
                className="border rounded px-3 py-2 w-full text-black"
              />
            </div>
            <p>
              <strong>Valor:</strong> R$ {p.valor?.toFixed(2) || "0.00"}
            </p>
            <div>
              <label className="text-sm block mb-1">Status</label>
              <select
                value={p.status || ""}
                onChange={(e) =>
                  atualizarStatus(p.id, e.target.value, "status")
                }
                className={`border rounded px-3 py-2 w-full ${
                  p.status === "Entregue"
                    ? "bg-purple-100 text-purple-800"
                    : p.status === "Pronto"
                    ? "bg-pink-100 text-pink-700"
                    : p.status === "Produzindo"
                    ? "bg-blue-100 text-blue-800"
                    : p.status === "Saiu para entrega"
                    ? "bg-orange-100 text-orange-800"
                    : p.status === "Aguardando"
                    ? "bg-gray-100 text-gray-700"
                    : ""
                }`}
              >
                {statusOptions
                  .filter((opt) => opt.value !== "")
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1">Pagamento</label>
              <select
                value={p.pagamento || ""}
                onChange={(e) =>
                  atualizarStatus(p.id, e.target.value, "pagamento")
                }
                className={`border rounded px-3 py-2 w-full ${
                  p.pagamento === "Pago"
                    ? "bg-green-100 text-green-800"
                    : p.pagamento === "Pendente"
                    ? "bg-red-100 text-red-800"
                    : ""
                }`}
              >
                {pagamentoOptions
                  .filter((opt) => opt.value !== "")
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>
            <p>
              <strong>Observações:</strong> {p.observacoes || "-"}
            </p>
            <button
              onClick={() => {
                setIdExcluir(p.id);
                setModalOpen(true);
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              🗑️ Excluir
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mensagem="Tem certeza que deseja excluir este pedido?"
        onConfirm={() => excluirPedido(idExcluir)}
      />
    </div>
  );
}
