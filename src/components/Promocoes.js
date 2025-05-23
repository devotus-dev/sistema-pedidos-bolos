import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function Promocoes() {
  const categorias = ["Mini", "G", "Vulcao"];
  const [promocoes, setPromocoes] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "promocoes"), (snapshot) => {
      const dados = {};
      snapshot.forEach((doc) => {
        dados[doc.id] = doc.data();
      });
      setPromocoes(dados);
    });
    return () => unsub();
  }, []);

  const salvarPromocao = async (categoria) => {
    try {
      await setDoc(doc(db, "promocoes", categoria), promocoes[categoria]);
      toast.success(`Promoção de ${categoria} salva!`);
    } catch (error) {
      toast.error("Erro ao salvar promoção!");
    }
  };

  const handleChange = (categoria, campo, valor) => {
    setPromocoes((prev) => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [campo]: campo === "valor" ? Number(valor) : valor,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Promoções</h2>

      {categorias.map((cat) => (
        <div key={cat} className="bg-white border p-4 rounded shadow mb-4">
          <h3 className="text-xl font-bold mb-2">{cat}</h3>

          <label className="block mb-1">Tipo de Desconto</label>
          <select
            value={promocoes[cat]?.tipo || "percentual"}
            onChange={(e) => handleChange(cat, "tipo", e.target.value)}
            className="border rounded px-3 py-2 mb-2"
          >
            <option value="percentual">Porcentagem (%)</option>
            <option value="valor">Valor fixo (R$)</option>
          </select>

          <label className="block mb-1">Valor do Desconto</label>
          <input
            type="number"
            value={promocoes[cat]?.valor || ""}
            onChange={(e) => handleChange(cat, "valor", e.target.value)}
            className="border rounded px-3 py-2 mb-2"
          />

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={promocoes[cat]?.ativo || false}
              onChange={(e) => handleChange(cat, "ativo", e.target.checked)}
              className="mr-2"
            />
            <label>Ativar promoção</label>
          </div>

          <button
            onClick={() => salvarPromocao(cat)}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Salvar Promoção
          </button>
        </div>
      ))}
    </div>
  );
}
