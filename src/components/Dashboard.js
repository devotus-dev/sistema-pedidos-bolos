import React, { useEffect, useState } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {
  const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const [pedidos, setPedidos] = useState([]);
  const [promocoes, setPromocoes] = useState({});
  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [pedidosPagos, setPedidosPagos] = useState(0);
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [pedidosReceber, setPedidosReceber] = useState(0);
  const [valorReceber, setValorReceber] = useState(0);

  // 🔥 Busca pedidos em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Busca promoções
  useEffect(() => {
    async function fetchPromocoes() {
      const snap = await getDocs(collection(db, "promocoes"));
      const data = {};
      snap.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setPromocoes(data);
    }
    fetchPromocoes();
  }, []);

  // 🔥 Filtrar pedidos pela data
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const data = pedido.dataEntrega;
    if (!data) return false;

    return (
      (!dataInicial || data >= dataInicial) &&
      (!dataFinal || data <= dataFinal)
    );
  });

  // 🔥 Calcula totais
  useEffect(() => {
    const calcularTotalPedido = (pedido) => {
      if (!pedido.itens) return 0;
      return pedido.itens.reduce((total, item) => {
        let preco = item.preco || 0;
        const promocao = promocoes[item.categoria];
        if (promocao?.ativo) {
          if (promocao.tipo === "percentual") {
            preco -= preco * (promocao.valor / 100);
          } else if (promocao.tipo === "valor") {
            preco -= promocao.valor;
          }
          if (preco < 0) preco = 0;
        }
        return total + preco * (item.quantidade || 1);
      }, 0);
    };

    const pagos = pedidosFiltrados.filter((p) => p.pagamento === "Pago");
    const pendentes = pedidosFiltrados.filter((p) => p.pagamento !== "Pago");

    setTotalPedidos(pedidosFiltrados.length);
    setPedidosPagos(pagos.length);
    setPedidosReceber(pendentes.length);

    const somaRecebido = pagos.reduce(
      (total, pedido) => total + calcularTotalPedido(pedido),
      0
    );
    const somaReceber = pendentes.reduce(
      (total, pedido) => total + calcularTotalPedido(pedido),
      0
    );

    setTotalRecebido(somaRecebido);
    setValorReceber(somaReceber);
  }, [pedidosFiltrados, promocoes]);

  // 🔥 Formata valor em reais
  function formatarReais(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Dashboard</h2>

      {/* 🔍 Filtros de data */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Data Inicial</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Data Final</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="border rounded px-3 py-2 w-[150px]"
          />
        </div>
      </div>

      {/* 📊 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-pink-100 p-6 rounded shadow text-center">
          <p className="text-xl font-semibold">Total de pedidos</p>
          <p className="text-4xl font-bold text-pink-700">{totalPedidos}</p>
        </div>
        <div className="bg-purple-100 p-6 rounded shadow text-center">
          <p className="text-xl font-semibold">Pedidos pagos</p>
          <p className="text-4xl font-bold text-purple-700">{pedidosPagos}</p>
        </div>
        <div className="bg-green-100 p-6 rounded shadow text-center">
          <p className="text-xl font-semibold">Total recebido</p>
          <p className="text-4xl font-bold text-green-700">
            {formatarReais(totalRecebido)}
          </p>
        </div>
        <div className="bg-yellow-100 p-6 rounded shadow text-center">
          <p className="text-xl font-semibold">Pedidos a receber</p>
          <p className="text-4xl font-bold text-yellow-700">{pedidosReceber}</p>
        </div>
        <div className="bg-red-100 p-6 rounded shadow text-center">
          <p className="text-xl font-semibold">Valor a receber</p>
          <p className="text-4xl font-bold text-red-700">
            {formatarReais(valorReceber)}
          </p>
        </div>
      </div>
    </div>
  );
}
