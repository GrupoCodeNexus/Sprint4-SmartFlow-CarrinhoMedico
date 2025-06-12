import React, { useEffect, useState } from "react";
import axios from "axios";

// Mapeamento de estados para classes Tailwind de cor de fundo
const coresPorEstadoClasses = {
  aberto: "bg-red-500",    // Vermelho: Em uso / Emergência
  fechado: "bg-green-500",  // Verde: Completo e pronto
  estoque: "bg-yellow-500", // Amarelo: Necessita reposição
  vazio: "bg-gray-400",     // Cinza: Sem carrinho cadastrado no andar
};

// Ordem de prioridade para exibir o status de um andar com múltiplos carrinhos
const statusPrioridade = {
  aberto: 1,
  estoque: 2,
  fechado: 3,
  vazio: 4,
};

// Função para extrair o número do andar de uma string de localização
function extrairNumeroAndar(localizacao) {
  const match = localizacao.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export default function StatusCarrinhos() {
  const [andaresComCarrinhos, setAndaresComCarrinhos] = useState(Array(24).fill([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Novo estado para controlar o índice do carrinho atualmente visível em cada andar
  // Mapeia andarIndex para o índice do carrinho dentro do array daquele andar
  const [currentCarrinhoIndexForAndar, setCurrentCarrinhoIndexForAndar] = useState({});

  async function fetchCarrinhos() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/carrinhos");

      const tempAndares = Array(24).fill().map(() => []);

      response.data.forEach((carrinho) => {
        const andar = extrairNumeroAndar(carrinho.localizacao);
        if (andar >= 1 && andar <= 24) {
          tempAndares[andar - 1].push(carrinho);
        }
      });

      setAndaresComCarrinhos(tempAndares);

      // Inicializa os índices de rotação
      const initialIndices = {};
      tempAndares.forEach((carrinhosNoAndar, index) => {
        if (carrinhosNoAndar.length > 1) {
          initialIndices[index] = 0; // Começa exibindo o primeiro carrinho
        }
      });
      setCurrentCarrinhoIndexForAndar(initialIndices);

    } catch (err) {
      console.error("Erro ao buscar carrinhos:", err);
      setError("Não foi possível carregar os carrinhos. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCarrinhos();
  }, []);

  // Efeito para gerenciar a rotação dos carrinhos
  useEffect(() => {
    const intervals = {};

    andaresComCarrinhos.forEach((carrinhosNoAndar, andarIndex) => {
      // Ativa a rotação apenas para andares com múltiplos carrinhos
      if (carrinhosNoAndar.length > 1) {
        intervals[andarIndex] = setInterval(() => {
          setCurrentCarrinhoIndexForAndar(prev => {
            const currentIdx = prev[andarIndex] || 0;
            const nextIdx = (currentIdx + 1) % carrinhosNoAndar.length;
            return {
              ...prev,
              [andarIndex]: nextIdx
            };
          });
        }, 5000); // Rotação a cada 5 segundos
      }
    });

    // Limpeza dos intervalos ao desmontar o componente ou quando os carrinhos mudam
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [andaresComCarrinhos]); // Depende de `andaresComCarrinhos` para reiniciar intervalos se os dados mudarem

  const getStatusDoAndar = (carrinhosNoAndar) => {
    if (!carrinhosNoAndar || carrinhosNoAndar.length === 0) {
      return "vazio";
    }

    let statusPrioritario = "fechado";

    carrinhosNoAndar.forEach(carrinho => {
      const statusAtual = carrinho.status || "estoque";
      if (statusPrioridade[statusAtual] < statusPrioridade[statusPrioritario]) {
        statusPrioritario = statusAtual;
      }
    });

    return statusPrioritario;
  };

  const handleToggleStatus = async (andarIndex) => {
    const carrinhosNoAndar = andaresComCarrinhos[andarIndex];

    if (!carrinhosNoAndar || carrinhosNoAndar.length === 0) {
      console.warn(`Andar ${andarIndex + 1} está vazio. Não é possível alterar status.`);
      return;
    }

    // Se houver múltiplos carrinhos, a ação de clique precisa ser mais granular.
    // Neste caso, vamos assumir que queremos alterar o status do carrinho atualmente visível.
    // Se o andar tem apenas um carrinho, ele será o `currentCarrinhoIndex`.
    const indexToUpdate = carrinhosNoAndar.length > 1
        ? (currentCarrinhoIndexForAndar[andarIndex] || 0) // Usa o índice de rotação
        : 0; // Se for um único carrinho, sempre o primeiro

    const carrinhoParaAtualizar = carrinhosNoAndar[indexToUpdate];

    if (!carrinhoParaAtualizar) {
        console.warn(`Carrinho para atualizar não encontrado no andar ${andarIndex + 1} no índice ${indexToUpdate}.`);
        return;
    }

    let novoStatus;
    if (carrinhoParaAtualizar.status === "aberto") {
      novoStatus = "fechado";
    } else if (carrinhoParaAtualizar.status === "fechado") {
      novoStatus = "estoque";
    } else {
      novoStatus = "aberto";
    }

    try {
      await axios.patch(
        `http://localhost:3001/carrinhos/${carrinhoParaAtualizar.id}`,
        { status: novoStatus }
      );

      setAndaresComCarrinhos(prevAndares => {
        const newAndares = [...prevAndares];
        // Encontra o carrinho atualizado e substitui-o
        newAndares[andarIndex] = newAndares[andarIndex].map(c =>
          c.id === carrinhoParaAtualizar.id ? { ...c, status: novoStatus } : c
        );
        return newAndares;
      });
    } catch (err) {
      console.error(
        `Erro ao atualizar status do carrinho ${carrinhoParaAtualizar.id} no andar ${andarIndex + 1}:`,
        err
      );
      alert("Erro ao atualizar o status do carrinho. Verifique o console.");
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-gray-50 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Status dos Carrinhos de Emergência por Andar
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-screen-xl">
        {/* Coluna Principal - Grade de Carrinhos */}
        <div className="flex-grow">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-4 justify-items-center">
            {Array.from({ length: 24 }).map((_, index) => {
              const andar = index + 1;
              const carrinhosNoAndar = andaresComCarrinhos[index];

              // Determina qual carrinho exibir (para rotação) ou o único carrinho
              const currentCarrinhoIndex = carrinhosNoAndar.length > 1
                ? (currentCarrinhoIndexForAndar[index] || 0)
                : 0; // Se 1 ou 0 carrinhos, sempre pega o primeiro (ou índice 0)

              const carrinhoParaExibir = carrinhosNoAndar[currentCarrinhoIndex];

              const statusParaExibir = carrinhoParaExibir?.status || "vazio"; // Usa o status do carrinho específico
              const bgColorClass = coresPorEstadoClasses[statusParaExibir] || "bg-gray-400";

              const nomeCarrinhoDisplay = carrinhoParaExibir?.nome || "(Vazio)";

              return (
                <div
                  key={andar}
                  className={`
                    carrinho-item
                    relative w-28 h-28 sm:w-28 sm:h-28 // Tamanho fixo e responsivo
                    rounded-xl shadow-md flex flex-col items-center justify-end p-1
                    text-white font-bold text-center text-xs leading-tight
                    cursor-pointer transition-colors duration-300 ease-in-out
                    bg-contain bg-no-repeat bg-center
                    ${bgColorClass}
                  `}
                  style={{
                    backgroundImage:
                      "url('https://cdn-icons-png.flaticon.com/512/263/263142.png')",
                  }}
                  onClick={() => handleToggleStatus(index)}
                >
                  <div className="absolute inset-0 flex flex-col justify-end items-center p-1">
                    <div className="bg-black bg-opacity-40 rounded px-1 py-0.5 whitespace-pre-line">
                      {`${andar}º Andar\n${nomeCarrinhoDisplay}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Lateral - Legenda */}
        <div className="lg:w-1/4 p-4 bg-white rounded-lg shadow-lg flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Legenda</h2>
          <div className="space-y-4">
            {/* Item da Legenda: Aberto */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${coresPorEstadoClasses.aberto} shadow`}></div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Carrinho Aberto:</span> Em uso para emergência ou manutenção.
              </p>
            </div>
            {/* Item da Legenda: Fechado */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${coresPorEstadoClasses.fechado} shadow`}></div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Carrinho Fechado:</span> Completo e pronto para uso.
              </p>
            </div>
            {/* Item da Legenda: Estoque */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${coresPorEstadoClasses.estoque} shadow`}></div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Estoque Incompleto:</span> Necessita reposição de itens.
              </p>
            </div>
            {/* Item da Legenda: Vazio/Não Cadastrado */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${coresPorEstadoClasses.vazio} shadow`}></div>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Andar Vazio:</span> Sem carrinho cadastrado para este andar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}