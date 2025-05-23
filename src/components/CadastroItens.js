import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

export default function CadastroItens() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [itens, setItens] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [idExcluir, setIdExcluir] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "itens"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItens(lista);
    });
    return () => unsubscribe();
  }, []);

  const adicionarItem = async (e) => {
    e.preventDefault();
    if (!nome || !preco || !categoria) {
      toast.error("Preencha nome, preço e categoria!");
      return;
    }

    try {
      await addDoc(collection(db, "itens"), {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        imagemUrl,
      });
      toast.success("Item cadastrado!");
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setImagemUrl("");
    } catch (error) {
      toast.error("Erro ao cadastrar item!");
    }
  };

  const excluirItem = async (id) => {
    try {
      await deleteDoc(doc(db, "itens", id));
      toast.success("Item excluído!");
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir item!");
    }
  };

  const atualizarItem = async (id, campo, valor) => {
    try {
      const itemRef = doc(db, "itens", id);
      await updateDoc(itemRef, {
        [campo]: campo === "preco" ? Number(valor) : valor,
      });
      toast.success("Item atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar item!");
    }
  };

  const itensFiltrados = itens
    .filter((item) => categoriaFiltro === "" || item.categoria === categoriaFiltro)
    .sort((a, b) => a.preco - b.preco);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Cadastro de Itens</h2>

      {/* 🔍 Filtro por Categoria */}
      <div className="mb-6">
        <label className="text-sm mb-1 block text-gray-600">Filtrar por Categoria</label>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border rounded px-3 py-2 w-[200px]"
        >
          <option value="">Todas</option>
          <option value="Mini">Mini</option>
          <option value="G">G</option>
          <option value="Vulcao">Vulcão</option>
        </select>
      </div>

      {/* 📝 Formulário */}
      <form
        onSubmit={adicionarItem}
        className="bg-white rounded-lg shadow-md p-6 border space-y-4 mb-8"
      >
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Selecione</option>
              <option value="Mini">Mini</option>
              <option value="G">G</option>
              <option value="Vulcao">Vulcão</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Imagem (URL)</label>
            <input
              type="text"
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          Cadastrar
        </button>
      </form>

      {/* 🗂️ Lista de Itens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {itensFiltrados.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-4 border space-y-2"
          >
            {item.imagemUrl && (
              <img
                src={item.imagemUrl}
                alt={item.nome}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <div>
              <input
                type="text"
                value={item.nome}
                onChange={(e) => atualizarItem(item.id, "nome", e.target.value)}
                className="font-bold text-lg border rounded px-2 py-1 w-full"
              />
            </div>
            <div>
              <textarea
                value={item.descricao}
                onChange={(e) => atualizarItem(item.id, "descricao", e.target.value)}
                className="text-sm text-gray-600 border rounded px-2 py-1 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={item.categoria}
                onChange={(e) => atualizarItem(item.id, "categoria", e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="Mini">Mini</option>
                <option value="G">G</option>
                <option value="Vulcao">Vulcão</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={item.preco}
                onChange={(e) => atualizarItem(item.id, "preco", e.target.value)}
                className="text-green-700 font-semibold border rounded px-2 py-1 w-[100px]"
              />
            </div>
            <button
              onClick={() => {
                setIdExcluir(item.id);
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
        mensagem="Tem certeza que deseja excluir este item?"
        onConfirm={() => excluirItem(idExcluir)}
      />
    </div>
  );
}
