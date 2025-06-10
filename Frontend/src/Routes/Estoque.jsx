import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EstoquePage = () => {
  const [estoquePadrao, setEstoquePadrao] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstoquePadrao = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3001/estoque-padrao");
        setEstoquePadrao(response.data);
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

  const handleItemChange = (gavetaId, itemId, field, value) => {
    const updatedEstoque = { ...estoquePadrao };
    const gavetaIndex = updatedEstoque.gavetas.findIndex(g => g.id === gavetaId);
    if (gavetaIndex !== -1) {
      const itemIndex = updatedEstoque.gavetas[gavetaIndex].itens.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        updatedEstoque.gavetas[gavetaIndex].itens[itemIndex][field] = field === 'quantidade' ? parseInt(value, 10) : value;
        setEstoquePadrao(updatedEstoque);
      }
    }
  };

  const handleUpdateEstoque = async () => {
    setMessage('');
    setIsError(false);
    try {
      await axios.put("http://localhost:3001/estoque-padrao", estoquePadrao);
      setMessage('Estoque padrão atualizado com sucesso! Novos carrinhos usarão este padrão.');
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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento do Estoque Padrão</h1>
      <p className="mb-4 text-gray-700">
        Altere os valores abaixo para definir o estoque padrão para <span className="font-semibold text-blue-600">novos</span> carrinhos.
        Carrinhos já existentes <span className="font-semibold text-red-600">não serão</span> afetados automaticamente.
      </p>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {estoquePadrao.gavetas.map(gaveta => (
        <div key={gaveta.id} className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">{gaveta.nome}</h2>
          <div className="space-y-4">
            {gaveta.itens.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <label htmlFor={`item-nome-${item.id}`} className="font-medium text-gray-700 sm:w-1/3">
                  Nome:
                </label>
                <input
                  type="text"
                  id={`item-nome-${item.id}`}
                  value={item.nome}
                  onChange={(e) => handleItemChange(gaveta.id, item.id, 'nome', e.target.value)}
                  className="w-full sm:w-1/3 border border-gray-300 rounded-md shadow-sm p-2 text-center"
                />

                <label htmlFor={`item-quantidade-${item.id}`} className="font-medium text-gray-700 sm:w-1/4">
                  Quantidade:
                </label>
                <input
                  type="number"
                  id={`item-quantidade-${item.id}`}
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(gaveta.id, item.id, 'quantidade', e.target.value)}
                  className="w-full sm:w-1/4 border border-gray-300 rounded-md shadow-sm p-2 text-center"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleUpdateEstoque}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mt-6"
      >
        Atualizar Estoque Padrão
      </button>
    </div>
  );
};

export default EstoquePage;