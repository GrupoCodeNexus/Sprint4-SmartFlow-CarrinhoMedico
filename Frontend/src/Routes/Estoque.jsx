import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EstoquePage = () => {
  const [estoquePadrao, setEstoquePadrao] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para controlar a visibilidade das gavetas (true = expandida, false = recolhida)
  const [expandedGavetas, setExpandedGavetas] = useState({});

  useEffect(() => {
    const fetchEstoquePadrao = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3001/estoque-padrao");
        setEstoquePadrao(response.data);

        // Inicializa todas as gavetas como expandidas por padrão (ou como preferir)
        const initialExpandedState = {};
        response.data.gavetas.forEach(gaveta => {
          initialExpandedState[gaveta.id || gaveta.nome] = true; // Usa id ou nome como chave
        });
        setExpandedGavetas(initialExpandedState);

      } catch (err) {
        console.error('Erro ao buscar estoque padrão:', err);
        setError(err.message || 'Erro ao carregar estoque padrão.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEstoquePadrao();
  }, []);

  // Função para alternar a visibilidade de uma gaveta
  const toggleGavetaVisibility = (gavetaKey) => {
    setExpandedGavetas(prev => ({
      ...prev,
      [gavetaKey]: !prev[gavetaKey]
    }));
  };

  // --- Funções para Manipular o Estoque Padrão ---

  // Função para mudar o nome ou quantidade de um item existente
  const handleItemChange = (gavetaId, itemId, field, value) => {
    setEstoquePadrao(prevEstoque => {
      const updatedGavetas = prevEstoque.gavetas.map(gaveta => {
        if (gaveta.id === gavetaId || (gaveta.id === undefined && gaveta.nome === gavetaId)) { // Suporta gavetas com ou sem ID
          const updatedItens = gaveta.itens.map(item => {
            if (item.id === itemId || (item.id === undefined && item.nome === itemId)) { // Suporta itens com ou sem ID
              return { ...item, [field]: (field === 'quantidade' && value !== '') ? parseInt(value, 10) : value };
            }
            return item;
          });
          return { ...gaveta, itens: updatedItens };
        }
        return gaveta;
      });
      return { ...prevEstoque, gavetas: updatedGavetas };
    });
  };

  // Função para adicionar um novo item a uma gaveta
  const handleAddItem = (gavetaId) => {
    setEstoquePadrao(prevEstoque => {
      const updatedGavetas = prevEstoque.gavetas.map(gaveta => {
        if (gaveta.id === gavetaId || (gaveta.id === undefined && gaveta.nome === gavetaId)) {
          const newItem = {
            id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporário único
            nome: 'Novo Item',
            quantidade: 0
          };
          return { ...gaveta, itens: [...gaveta.itens, newItem] };
        }
        return gaveta;
      });
      return { ...prevEstoque, gavetas: updatedGavetas };
    });
  };

  // Função para remover um item de uma gaveta
  const handleRemoveItem = (gavetaId, itemId) => {
    setEstoquePadrao(prevEstoque => {
      const updatedGavetas = prevEstoque.gavetas.map(gaveta => {
        if (gaveta.id === gavetaId || (gaveta.id === undefined && gaveta.nome === gavetaId)) {
          const filteredItens = gaveta.itens.filter(item => item.id !== itemId && (item.id !== undefined || item.nome !== itemId)); // Remove por ID ou nome se ID não existir
          return { ...gaveta, itens: filteredItens };
        }
        return gaveta;
      });
      return { ...prevEstoque, gavetas: updatedGavetas };
    });
  };

  // Função para adicionar uma nova gaveta
  const handleAddGaveta = () => {
    setEstoquePadrao(prevEstoque => {
      const newGaveta = {
        id: `GAV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporário único
        nome: 'Nova Gaveta',
        itens: []
      };
      // Expande a nova gaveta por padrão
      setExpandedGavetas(prev => ({ ...prev, [newGaveta.id]: true }));
      return { ...prevEstoque, gavetas: [...prevEstoque.gavetas, newGaveta] };
    });
  };

  // Função para remover uma gaveta
  const handleRemoveGaveta = (gavetaId) => {
    if (window.confirm('Tem certeza que deseja remover esta gaveta e todos os seus itens do estoque padrão?')) {
      setEstoquePadrao(prevEstoque => {
        const filteredGavetas = prevEstoque.gavetas.filter(gaveta =>
          gaveta.id !== gavetaId && (gaveta.id !== undefined || gaveta.nome !== gavetaId)
        );
        // Remove a gaveta do estado de expandido
        setExpandedGavetas(prev => {
            const newState = { ...prev };
            delete newState[gavetaId];
            return newState;
        });
        return { ...prevEstoque, gavetas: filteredGavetas };
      });
    }
  };

  // Função para atualizar o nome da gaveta
  const handleGavetaNameChange = (gavetaId, newName) => {
    setEstoquePadrao(prevEstoque => {
      const updatedGavetas = prevEstoque.gavetas.map(gaveta => {
        if (gaveta.id === gavetaId || (gaveta.id === undefined && gaveta.nome === gavetaId)) {
          return { ...gaveta, nome: newName };
        }
        return gaveta;
      });
      return { ...prevEstoque, gavetas: updatedGavetas };
    });
  };

  // Função para enviar as alterações para o backend
  const handleUpdateEstoque = async () => {
    setMessage('');
    setIsError(false);
    try {

      await axios.put("http://localhost:3001/estoque-padrao", estoquePadrao);
      setMessage('Estoque padrão e todos os carrinhos atualizados com sucesso!');
      setIsError(false);
    } catch (err) {
      console.error('Erro ao atualizar estoque padrão:', err);
      setMessage('Erro ao atualizar estoque padrão.');
      setIsError(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-700">
        Carregando estoque padrão...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
        Erro ao carregar estoque padrão: {error}
      </div>
    );
  }

  // Verificar se estoquePadrao é nulo ou se gavetas não é um array
  if (!estoquePadrao || !Array.isArray(estoquePadrao.gavetas)) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded-md">
        Nenhum estoque padrão encontrado ou formato inválido. Por favor, adicione gavetas.
        <button
          onClick={handleAddGaveta}
          className="ml-4 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200"
        >
          Adicionar Primeira Gaveta
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento do Estoque Padrão</h1>
      <p className="mb-4 text-gray-700">
        Altere os valores abaixo para definir o estoque padrão para <span className="font-semibold text-blue-600">novos</span> carrinhos.
        Carrinhos já existentes <span className="font-semibold text-red-600">serão</span> afetados automaticamente após a atualização.
      </p>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <button
        onClick={handleAddGaveta}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mb-6"
      >
        Adicionar Nova Gaveta
      </button>

      <div className="space-y-6">
        {estoquePadrao.gavetas.map((gaveta, gavetaIndex) => {
          // Usar o ID da gaveta como chave, fallback para nome se ID não existir
          const gavetaKey = gaveta.id || gaveta.nome;
          const isExpanded = expandedGavetas[gavetaKey];

          return (
            <div key={gavetaKey} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={gaveta.nome}
                  onChange={(e) => handleGavetaNameChange(gavetaKey, e.target.value)}
                  className="text-2xl font-semibold text-blue-700 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 bg-transparent w-full mr-4"
                />
                <div className="flex space-x-2">
                    <button
                        onClick={() => toggleGavetaVisibility(gavetaKey)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-md transition duration-200"
                    >
                        {isExpanded ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                        onClick={() => handleRemoveGaveta(gavetaKey)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition duration-200"
                    >
                        Remover Gaveta
                    </button>
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-4 pt-2">
                  {gaveta.itens && gaveta.itens.length > 0 ? (
                    gaveta.itens.map((item) => {
                      // Usar o ID do item como chave, fallback para nome se ID não existir
                      const itemKey = item.id || item.nome;
                      return (
                        <div key={itemKey} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2 bg-gray-50 rounded-md border border-gray-200">
                          <div className="sm:w-1/2 flex items-center">
                            <label htmlFor={`item-nome-${gavetaKey}-${itemKey}`} className="font-medium text-gray-700 w-1/4 min-w-[60px]">Nome:</label>
                            <input
                              type="text"
                              id={`item-nome-${gavetaKey}-${itemKey}`}
                              value={item.nome}
                              onChange={(e) => handleItemChange(gavetaKey, itemKey, 'nome', e.target.value)}
                              className="w-full sm:w-3/4 border border-gray-300 rounded-md shadow-sm p-2"
                            />
                          </div>
                          <div className="sm:w-1/2 flex items-center">
                            <label htmlFor={`item-quantidade-${gavetaKey}-${itemKey}`} className="font-medium text-gray-700 w-1/3 min-w-[90px]">Quantidade:</label>
                            <input
                              type="number"
                              id={`item-quantidade-${gavetaKey}-${itemKey}`}
                              value={item.quantidade}
                              onChange={(e) => handleItemChange(gavetaKey, itemKey, 'quantidade', e.target.value)}
                              className="w-full sm:w-2/3 border border-gray-300 rounded-md shadow-sm p-2 text-center"
                              min="0"
                            />
                            <button
                              onClick={() => handleRemoveItem(gavetaKey, itemKey)}
                              className="ml-4 bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-2 rounded-md transition duration-200 text-sm"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 italic">Nenhum item nesta gaveta.</p>
                  )}
                  <button
                    onClick={() => handleAddItem(gavetaKey)}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                  >
                    Adicionar Novo Item
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleUpdateEstoque}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mt-6"
      >
        Salvar Alterações no Estoque Padrão
      </button>
    </div>
  );
};

export default EstoquePage;