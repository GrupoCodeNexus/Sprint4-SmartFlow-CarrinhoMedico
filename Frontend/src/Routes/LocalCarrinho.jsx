import React, { useEffect, useState } from "react";
import axios from "axios";

// Mapeamento de estados para cores
const coresPorEstado = {
  aberto: "red",
  fechado: "green",
  estoque: "goldenrod", // Cor amarelada/dourada para estoque
};

// Função para extrair o número do andar de uma string de localização
function extrairNumeroAndar(localizacao) {
  const match = localizacao.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export default function StatusCarrinhos() {
  // Estado para armazenar os dados dos carrinhos, inicializado com 36 posições nulas
  const [carrinhos, setCarrinhos] = useState(Array(36).fill(null));

  // Função assíncrona para buscar os dados dos carrinhos do backend
  async function fetchCarrinhos() {
    try {
      const response = await axios.get("http://localhost:3001/carrinhos");

      // Cria um novo array de 36 posições para garantir que todos os andares sejam representados
      const novosCarrinhos = Array(36).fill(null);

      // Preenche o array com os dados dos carrinhos retornados pela API
      response.data.forEach((carrinho) => {
        const andar = extrairNumeroAndar(carrinho.localizacao);
        if (andar >= 1 && andar <= 36) {
          // Coloca o carrinho na posição correta do array (andar - 1 porque arrays são base 0)
          novosCarrinhos[andar - 1] = carrinho;
        }
      });

      // Atualiza o estado com os dados dos carrinhos
      setCarrinhos(novosCarrinhos);
    } catch (error) {
      console.error("Erro ao buscar carrinhos:", error);
      // Opcional: exibir uma mensagem de erro na interface do usuário
      // alert("Não foi possível carregar os carrinhos. Verifique a conexão com o servidor.");
    }
  }

  // Hook useEffect para carregar os carrinhos quando o componente é montado
  useEffect(() => {
    fetchCarrinhos();
    // O array vazio [] como segundo argumento garante que este efeito
    // rode apenas uma vez, similar a componentDidMount.
  }, []);

  // Função para lidar com o clique em um carrinho e alternar seu status
  const handleToggleStatus = async (carrinhoExistente, index) => {
    // Verifica se o carrinho existe e tem um ID para que possamos atualizá-lo
    if (!carrinhoExistente || !carrinhoExistente.id) {
      console.warn("Carrinho não encontrado ou sem ID para atualizar.");
      // Se for um espaço vazio (null), podemos inicializá-lo com um status e ID temporário
      // ou simplesmente ignorar o clique, dependendo da sua regra de negócio.
      // Neste exemplo, vamos ignorar.
      return;
    }

    let novoStatus;
    // Lógica para alternar entre os estados
    if (carrinhoExistente.status === "aberto") {
      novoStatus = "fechado";
    } else if (carrinhoExistente.status === "fechado") {
      novoStatus = "estoque"; // De fechado volta para estoque
    } else {
      novoStatus = "aberto"; // De estoque (ou qualquer outro) vai para aberto
    }

    try {
      // Envia uma requisição PATCH para o backend para atualizar o status do carrinho
      // O backend deve ter um endpoint /carrinhos/:id que aceita PATCH
      await axios.patch(
        `http://localhost:3001/carrinhos/${carrinhoExistente.id}`,
        {
          status: novoStatus, // Envia apenas o campo 'status' para atualização
        }
      );

      // Se a requisição foi bem-sucedida, atualiza o estado local para refletir a mudança
      // Isso garante que a interface do usuário seja atualizada imediatamente
      setCarrinhos((prevCarrinhos) => {
        const updatedCarrinhos = [...prevCarrinhos]; // Cria uma cópia do array
        // Atualiza o objeto do carrinho na posição correta do array
        updatedCarrinhos[index] = {
          ...carrinhoExistente, // Mantém as propriedades existentes
          status: novoStatus, // Atualiza apenas o status
        };
        return updatedCarrinhos;
      });
    } catch (error) {
      console.error(
        `Erro ao atualizar status do carrinho ${carrinhoExistente.id}:`,
        error
      );
      alert("Erro ao atualizar o status do carrinho. Verifique o console.");
    }
  };

  return (
    <>
      {/* Estilos CSS embutidos para o layout e aparência dos carrinhos */}
      <style>{`
        .grade {
          display: grid;
          grid-template-columns: repeat(6, 100px); /* 6 colunas de 100px */
          gap: 10px; /* Espaçamento entre os itens da grade */
        }
        .carrinho {
          width: 100px;
          height: 100px;
          background-size: contain; /* Ajusta a imagem de fundo para caber */
          background-repeat: no-repeat;
          background-position: center;
          position: relative;
          border-radius: 12px;
          box-shadow: 0 0 5px rgba(0,0,0,0.3); /* Sombra suave */
          display: flex;
          align-items: flex-end; /* Alinha o conteúdo (label) na parte inferior */
          justify-content: center;
          padding-bottom: 8px;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px black; /* Sombra para o texto */
          cursor: pointer; /* Indica que o elemento é clicável */
          transition: background-color 0.3s ease; /* Transição suave na cor de fundo */
        }
        .label {
          background-color: rgba(0, 0, 0, 0.4); /* Fundo semi-transparente para o texto */
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 12px;
          text-align: center;
          line-height: 1.2;
          white-space: pre-line; /* Permite que \n crie quebras de linha */
        }
      `}</style>

      <h1>Status dos Carrinhos</h1>

      <div className="grade">
        {/* Mapeia o array de carrinhos para renderizar cada item */}
        {carrinhos.map((carrinho, index) => {
          // Define o status (padrão 'estoque' se não houver ou for inválido)
          const status = carrinho?.status || "estoque";
          // Define a localização (padrão com o número do andar se não houver)
          const localizacao = carrinho?.localizacao || `${index + 1}º andar`;

          return (
            <div
              key={index} // Chave única para cada item na lista
              className="carrinho"
              style={{
                // Define a cor de fundo com base no status (ou cinza se não mapeado)
                backgroundColor: coresPorEstado[status] || "gray",
                // Imagem de fundo do ícone do carrinho
                backgroundImage:
                  "url('https://cdn-icons-png.flaticon.com/512/263/263142.png')",
              }}
              // Adiciona o evento de clique para alternar o status
              onClick={() => handleToggleStatus(carrinho, index)}
            >
              <div className="label">{`#${index + 1}\n${localizacao}`}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}