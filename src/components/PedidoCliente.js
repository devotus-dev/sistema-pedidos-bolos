import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function PedidoCliente() {
  const [pedido, setPedido] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    observacoes: "",
    dataEntrega: "",
  });

  const [itens, setItens] = useState([]);
  const [saborSelecionado, setSaborSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [promocoes, setPromocoes] = useState({});

  useEffect(() => {
    async function fetchData() {
      const itensSnapshot = await getDocs(collection(db, "itens"));
      const listaItens = itensSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔥 Ordenar por categoria: Mini > G > Vulcao
      const ordemCategorias = ["Mini", "G", "Vulcao"];
      const listaItensOrdenada = listaItens.sort(
        (a, b) =>
          ordemCategorias.indexOf(a.categoria) -
          ordemCategorias.indexOf(b.categoria)
      );

      setItens(listaItensOrdenada);

      const categorias = ["Mini", "G", "Vulcao"];
      const promocoesData = {};
      for (let cat of categorias) {
        const docSnap = await getDoc(doc(db, "promocoes", cat));
        if (docSnap.exists()) {
          promocoesData[cat] = docSnap.data();
        }
      }
      setPromocoes(promocoesData);
    }
    fetchData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setPedido({ ...pedido, [name]: value });
  }

  function adicionarAoCarrinho() {
    if (!saborSelecionado) {
      toast.error("Escolha um sabor!");
      return;
    }
    if (quantidade < 1) {
      toast.error("Quantidade inválida");
      return;
    }

    const item = itens.find((i) => i.nome === saborSelecionado);
    if (!item) {
      toast.error("Item não encontrado");
      return;
    }

    const itemExistenteIndex = carrinho.findIndex(
      (i) => i.nome === item.nome && i.categoria === item.categoria
    );

    const novoCarrinho = [...carrinho];

    if (itemExistenteIndex >= 0) {
      novoCarrinho[itemExistenteIndex].quantidade += quantidade;
    } else {
      novoCarrinho.push({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade,
        categoria: item.categoria,
      });
    }

    setCarrinho(novoCarrinho);
    toast.success("Item adicionado ao carrinho!");
  }

  function removerItem(index) {
    const novoCarrinho = [...carrinho];
    novoCarrinho.splice(index, 1);
    setCarrinho(novoCarrinho);
  }

  function atualizarQuantidade(index, novaQtd) {
    if (novaQtd < 1) return;
    const novoCarrinho = [...carrinho];
    novoCarrinho[index].quantidade = novaQtd;
    setCarrinho(novoCarrinho);
  }

  function calcularTotal() {
    return carrinho.reduce((total, item) => {
      let precoFinal = item.preco;
      const promo = promocoes[item.categoria];

      if (promo?.ativo) {
        if (promo.tipo === "percentual") {
          precoFinal = precoFinal * (1 - promo.valor / 100);
        } else if (promo.tipo === "valor") {
          precoFinal = Math.max(0, precoFinal - promo.valor);
        }
      }

      return total + precoFinal * item.quantidade;
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (carrinho.length === 0) {
      toast.error("Adicione pelo menos um item ao carrinho");
      return;
    }
    if (!pedido.dataEntrega) {
      toast.error("Preencha a data de entrega");
      return;
    }

    try {
      await addDoc(collection(db, "pedidos"), {
        ...pedido,
        itens: carrinho,
        valor: calcularTotal(),
        status: "Aguardando",
        pagamento: "Pendente",
      });

      let mensagem = `📝 *Novo Pedido!*\n\n👤 *Nome:* ${pedido.nome}\n📞 *Telefone:* ${pedido.telefone}\n🏠 *Endereço:* ${pedido.endereco}\n📅 *Entrega:* ${pedido.dataEntrega}\n🗒️ *Observações:* ${pedido.observacoes}\n\n🍰 *Itens:*\n`;
      carrinho.forEach((item) => {
        const promo = promocoes[item.categoria];
        let precoFinal = item.preco;
        if (promo?.ativo) {
          if (promo.tipo === "percentual") {
            precoFinal = precoFinal * (1 - promo.valor / 100);
          } else if (promo.tipo === "valor") {
            precoFinal = Math.max(0, precoFinal - promo.valor);
          }
        }
        mensagem += `- ${item.nome} (${item.categoria}) x${item.quantidade} = R$ ${(precoFinal * item.quantidade).toFixed(2)}\n`;
      });
      mensagem += `\n💰 *Total:* R$ ${calcularTotal().toFixed(2)}`;

      const lojaNumero = "556493108471";
      const linkWhatsapp = `https://wa.me/${lojaNumero}?text=${encodeURIComponent(
        mensagem
      )}`;
      window.open(linkWhatsapp, "_blank");

      toast.success("Pedido enviado com sucesso!");
      setPedido({
        nome: "",
        telefone: "",
        endereco: "",
        observacoes: "",
        dataEntrega: "",
      });
      setCarrinho([]);
      setSaborSelecionado("");
      setQuantidade(1);
    } catch (error) {
      toast.error("Erro ao enviar pedido!");
      console.error(error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white rounded shadow mt-10 space-y-4"
    >
      <h2 className="text-xl font-bold text-center text-pink-700 mb-4">
        Faça seu Pedido
      </h2>

      <input
        name="nome"
        value={pedido.nome}
        onChange={handleChange}
        placeholder="Nome"
        required
        className="border rounded px-3 py-2 w-full"
      />
      <input
        name="telefone"
        value={pedido.telefone}
        onChange={handleChange}
        placeholder="Telefone/WhatsApp"
        required
        className="border rounded px-3 py-2 w-full"
      />
      <input
        name="endereco"
        value={pedido.endereco}
        onChange={handleChange}
        placeholder="Endereço para entrega"
        required
        className="border rounded px-3 py-2 w-full"
      />

      {/* 🔥 Label para a data */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Data de entrega
        </label>
        <input
          type="date"
          name="dataEntrega"
          value={pedido.dataEntrega}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <textarea
        name="observacoes"
        value={pedido.observacoes}
        onChange={handleChange}
        placeholder="Observações"
        className="border rounded px-3 py-2 w-full"
      />

      {/* Seletor de Sabor */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={saborSelecionado}
          onChange={(e) => setSaborSelecionado(e.target.value)}
          className="border rounded px-3 py-2 flex-grow min-w-[150px]"
        >
          <option value="">Selecione o sabor</option>
          {itens.map((item) => (
            <option key={item.id} value={item.nome}>
              {item.nome} ({item.categoria}) - R$ {item.preco.toFixed(2)}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="border rounded px-3 py-2 w-24"
          placeholder="Qtd"
        />

        <button
          type="button"
          onClick={adicionarAoCarrinho}
          className="bg-pink-600 text-white px-4 rounded hover:bg-pink-700"
        >
          Adicionar
        </button>
      </div>

      {/* 🛒 Carrinho */}
      {carrinho.length > 0 && (
        <div className="border rounded p-4 space-y-2 bg-pink-50">
          <h3 className="font-bold text-lg mb-2">Itens no Carrinho</h3>
          {carrinho.map((item, index) => {
            const promo = promocoes[item.categoria];
            let precoFinal = item.preco;
            if (promo?.ativo) {
              if (promo.tipo === "percentual") {
                precoFinal = precoFinal * (1 - promo.valor / 100);
              } else if (promo.tipo === "valor") {
                precoFinal = Math.max(0, precoFinal - promo.valor);
              }
            }

            return (
              <div
                key={index}
                className="flex items-center justify-between border-b py-1"
              >
                <div>
                  <p>
                    {item.nome} - {item.categoria}
                  </p>
                  <p>
                    R$ {precoFinal.toFixed(2)} x {item.quantidade} = R$
                    {(precoFinal * item.quantidade).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarQuantidade(index, Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 w-16"
                  />
                  <button
                    type="button"
                    onClick={() => removerItem(index)}
                    className="text-red-600 font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          <div className="font-bold text-right mt-2">
            Total: R$ {calcularTotal().toFixed(2)}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-pink-600 text-white font-bold py-2 rounded hover:bg-pink-700"
      >
        Finalizar Pedido
      </button>
    </form>
  );
}
