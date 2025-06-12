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
// (quanto menor o número, maior a prioridade)
const statusPrioridade = {
  aberto: 1, // Um carrinho aberto torna o andar "vermelho"
  estoque: 2, // Se não há aberto, um com estoque incompleto torna "amarelo"
  fechado: 3, // Se só há fechados, o andar é "verde"
  vazio: 4, // Estado padrão se não houver carrinhos
};

// Função para extrair o número do andar de uma string de localização
function extrairNumeroAndar(localizacao) {
  const match = localizacao.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export default function StatusCarrinhos() {
  // Estado para armazenar os carrinhos agrupados por andar.
  // Cada posição do array principal (0-23) será um array de carrinhos para aquele andar.
  const [andaresComCarrinhos, setAndaresComCarrinhos] = useState(Array(24).fill([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchCarrinhos() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/carrinhos");

      // Inicializa um novo array de 24 posições, cada uma contendo um array vazio
      const tempAndares = Array(24).fill().map(() => []);

      response.data.forEach((carrinho) => {
        const andar = extrairNumeroAndar(carrinho.localizacao);
        if (andar >= 1 && andar <= 24) {
          // Adiciona o carrinho ao array correspondente ao seu andar
          tempAndares[andar - 1].push(carrinho);
        }
      });

      setAndaresComCarrinhos(tempAndares);
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

  // Função para determinar o status predominante de um andar
  const getStatusDoAndar = (carrinhosNoAndar) => {
    if (!carrinhosNoAndar || carrinhosNoAndar.length === 0) {
      return "vazio";
    }

    let statusPrioritario = "fechado"; // Assume 'fechado' como o melhor status inicial se houver carrinhos

    carrinhosNoAndar.forEach(carrinho => {
      const statusAtual = carrinho.status || "estoque"; // Default para 'estoque' se status não for definido
      if (statusPrioridade[statusAtual] < statusPrioridade[statusPrioritario]) {
        statusPrioritario = statusAtual;
      }
    });

    return statusPrioritario;
  };

  // Função para obter o nome do carrinho para exibição no card
  const getNomeCarrinhoDisplay = (carrinhosNoAndar) => {
      if (!carrinhosNoAndar || carrinhosNoAndar.length === 0) {
          return "(Vazio)";
      }
      // Se houver apenas um carrinho, exibe o nome dele
      if (carrinhosNoAndar.length === 1) {
          return carrinhosNoAndar[0].nome || '';
      }
      // Se houver múltiplos, exibe o nome do que tem o status de maior prioridade
      // ou apenas "Múltiplos" ou "Vários Carrinhos"
      let carrinhoPrioritario = carrinhosNoAndar[0];
      carrinhosNoAndar.forEach(carrinho => {
          const statusAtual = carrinho.status || "estoque";
          const statusPrioritarioAtual = carrinhoPrioritario.status || "estoque";
          if (statusPrioridade[statusAtual] < statusPrioridade[statusPrioritarioAtual]) {
              carrinhoPrioritario = carrinho;
          }
      });
      // Poderia ser mais complexo aqui, mas para simplicidade, pega o nome do prioritário
      return carrinhoPrioritario.nome || 'Múltiplos';
  };


  // Ações de clique: O que acontece quando você clica em um andar?
  // Se você clicar em um andar com múltiplos carrinhos, qual deles você quer alterar?
  // A lógica atual vai tentar alterar o status do *primeiro* carrinho que encontrar nesse andar.
  // Se quiser um comportamento mais complexo (ex: modal para escolher qual carrinho), seria necessário mais UI.
  const handleToggleStatus = async (andarIndex) => {
    const carrinhosNoAndar = andaresComCarrinhos[andarIndex];

    if (!carrinhosNoAndar || carrinhosNoAndar.length === 0) {
      console.warn(`Andar ${andarIndex + 1} está vazio. Não é possível alterar status.`);
      return; // Não faz nada se o andar estiver vazio
    }

    // Para simplificar, vamos alterar o status do PRIMEIRO carrinho encontrado neste andar.
    // Em um cenário real com múltiplos carrinhos, você pode querer um modal
    // para o usuário escolher qual carrinho quer gerenciar.
    const carrinhoParaAtualizar = carrinhosNoAndar[0];

    let novoStatus;
    // Lógica para alternar entre os estados: aberto -> fechado -> estoque -> aberto
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

      // Atualiza o estado local para refletir a mudança
      setAndaresComCarrinhos(prevAndares => {
        const newAndares = [...prevAndares];
        const updatedCarrinhosNoAndar = newAndares[andarIndex].map(c =>
          c.id === carrinhoParaAtualizar.id ? { ...c, status: novoStatus } : c
        );
        newAndares[andarIndex] = updatedCarrinhosNoAndar;
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
            {Array.from({ length: 24 }).map((_, index) => { // Mapeia para 24 andares
              const andar = index + 1;
              const carrinhosNoAndar = andaresComCarrinhos[index];
              const statusDoAndar = getStatusDoAndar(carrinhosNoAndar);
              const bgColorClass = coresPorEstadoClasses[statusDoAndar] || "bg-gray-400"; // Fallback para cinza
              const nomeCarrinhoDisplay = getNomeCarrinhoDisplay(carrinhosNoAndar);


              return (
                <div
                  key={andar} // Usamos o número do andar como key
                  className={`
                    carrinho-item
                    relative w-28 h-28 sm:w-28 sm:h-28 lg:w-32 lg:h-32 // Tamanho fixo e responsivo
                    rounded-xl shadow-md flex flex-col items-center justify-end p-1
                    text-white font-bold text-center text-xs leading-tight
                    cursor-pointer transition-colors duration-300 ease-in-out
                    bg-contain bg-no-repeat bg-center
                    ${bgColorClass}
                  `}
                  style={{
                    backgroundImage:
                      "url('https://cdn-icons-png.flaticon.com/512/263/263142.png')", // Ícone do carrinho
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