import React, { useEffect, useState } from "react";
import axios from "axios";

// Mapeamento de estados para classes Tailwind de cor de fundo
const coresPorEstadoClasses = {
  aberto: "bg-red-500", // Vermelho
  fechado: "bg-green-500", // Verde
  estoque: "bg-yellow-500", // Amarelo/Dourado
};

// Função para extrair o número do andar de uma string de localização
function extrairNumeroAndar(localizacao) {
  const match = localizacao.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export default function StatusCarrinhos() {
  const [carrinhos, setCarrinhos] = useState(Array(24).fill(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchCarrinhos() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/carrinhos");

      const novosCarrinhos = Array(24).fill(null); // Array de 24 posições para 24 andares

      response.data.forEach((carrinho) => {
        const andar = extrairNumeroAndar(carrinho.localizacao);
        if (andar >= 1 && andar <= 24) {
          novosCarrinhos[andar - 1] = carrinho;
        }
      });

      setCarrinhos(novosCarrinhos);
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

  const handleToggleStatus = async (carrinhoExistente, index) => {
    if (!carrinhoExistente || !carrinhoExistente.id) {
      console.warn("Espaço vazio ou carrinho sem ID. Não é possível atualizar o status.");
      return;
    }

    let novoStatus;
    // Lógica para alternar entre os estados: aberto -> fechado -> estoque -> aberto
    if (carrinhoExistente.status === "aberto") {
      novoStatus = "fechado";
    } else if (carrinhoExistente.status === "fechado") {
      novoStatus = "estoque";
    } else {
      novoStatus = "aberto";
    }

    try {
      await axios.patch(
        `http://localhost:3001/carrinhos/${carrinhoExistente.id}`,
        { status: novoStatus }
      );

      setCarrinhos((prevCarrinhos) => {
        const updatedCarrinhos = [...prevCarrinhos];
        updatedCarrinhos[index] = {
          ...carrinhoExistente,
          status: novoStatus,
        };
        return updatedCarrinhos;
      });
    } catch (err) {
      console.error(
        `Erro ao atualizar status do carrinho ${carrinhoExistente.id}:`,
        err
      );
      alert("Erro ao atualizar o status do carrinho. Verifique o console.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 text-lg">
        Carregando status dos carrinhos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md m-4">
        Erro: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-gray-50 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Status dos Carrinhos de Emergência por Andar
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-screen-xl"> {/* Ajusta largura máxima */}
        {/* Coluna Principal - Grade de Carrinhos */}
        <div className="flex-grow">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-6 justify-items-center">
            {carrinhos.map((carrinho, index) => {
              const status = carrinho?.status || "estoque"; // Padrão para 'estoque' se não houver carrinho
              const localizacaoDisplay = carrinho?.localizacao ? `${index + 1}º Andar\n${carrinho.nome || ''}` : `${index + 1}º Andar\n(Vazio)`;
              const bgColorClass = coresPorEstadoClasses[status] || "bg-gray-400"; // Cor padrão para cinza se o status não for mapeado

              return (
                <div
                  key={index}
                  className={`
                    carrinho-item
                    relative w-24 h-24 sm:w-28 sm:h-28 // Tamanho responsivo dos cards
                    rounded-xl shadow-md flex flex-col items-center justify-end p-1
                    text-white font-bold text-center text-[0.6rem] sm:text-xs leading-tight
                    cursor-pointer transition-colors duration-300 ease-in-out
                    bg-contain bg-no-repeat bg-center
                    ${bgColorClass}
                  `}
                  style={{
                    backgroundImage:
                      "url('https://cdn-icons-png.flaticon.com/512/263/263142.png')", // Ícone do carrinho
                  }}
                  onClick={() => handleToggleStatus(carrinho, index)}
                >
                  <div className="absolute inset-0 flex flex-col justify-end items-center p-1">
                    <div className="bg-black bg-opacity-40 rounded px-1 py-0.5 whitespace-pre-line">
                      {localizacaoDisplay}
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
              <div className={`w-8 h-8 rounded-full bg-gray-400 shadow`}></div>
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