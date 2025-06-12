import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CarrinhoForm from './CarrinhoForm';

const CarrinhoPage = () => {
  const [carrinhos, setCarrinhos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEstoqueGlobal, setShowEstoqueGlobal] = useState(true);

  const fetchCarrinhos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/carrinhos");
      setCarrinhos(response.data);
    } catch (err) {
      console.error('Erro ao buscar carrinhos:', err);
      setError(err.message || 'Erro ao carregar carrinhos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrinhos();
  }, []);

  const handleCarrinhoCreated = () => {
    setShowForm(false);
    fetchCarrinhos();
  };

  const handleDeleteCarrinho = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este carrinho?')) {
      try {
        await axios.delete(`http://localhost:3001/carrinhos/${id}`);
        fetchCarrinhos();
        alert('Carrinho excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir carrinho:', err);
        alert('Erro ao excluir carrinho: ' + (err.message || 'Erro desconhecido.'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-700">
        Carregando carrinhos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
        Erro ao carregar carrinhos: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Gerenciamento de Carrinhos de Emergência</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out cursor-pointer text-sm sm:text-base w-full sm:w-auto"
        >
          {showForm ? 'Esconder Formulário' : 'Adicionar Novo Carrinho'}
        </button>

        {/* botão de ocultar/mostrar todos os estoques - no topo */}
        <button
          onClick={() => setShowEstoqueGlobal(!showEstoqueGlobal)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out cursor-pointer text-sm sm:text-base w-full sm:w-auto"
        >
          {showEstoqueGlobal ? 'Ocultar Estoque de Todos' : 'Mostrar Estoque de Todos'}
        </button>
      </div>

      {showForm && <CarrinhoForm onCarrinhoCreated={handleCarrinhoCreated} />}

      <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-gray-700">Lista de Carrinhos</h2>

      {carrinhos.length === 0 ? (
        <p className="text-gray-600 italic">Nenhum carrinho foi cadastrado. Por favor, crie um.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carrinhos.map((carrinho) => (
            <div key={carrinho.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out p-6 border border-gray-200 flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">{carrinho.nome}</h3>
              <p className="text-gray-700 mb-4">
                <strong className="font-semibold">Localização:</strong> {carrinho.localizacao}
              </p>

              {/* Renderização do estoque do carrinho baseada no estado do botão */}
              {showEstoqueGlobal && (
                <>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Gavetas:</h4>
                  <div className="space-y-4">
                    {carrinho.gavetas && carrinho.gavetas.length > 0 ? (
                      carrinho.gavetas.map((gaveta) => (
                        <div key={gaveta.id || gaveta.nome} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h5 className="font-semibold text-blue-800 mb-2">{gaveta.nome}</h5>
                          <ul className="list-disc list-inside text-gray-700">
                            {gaveta.itens && gaveta.itens.length > 0 ? (
                              gaveta.itens.map((item) => (
                                <li key={item.id || item.nome} className="mb-1 text-sm md:text-base">
                                  <span className="font-medium">{item.nome}</span> - Quantidade: <span className="text-blue-600">{item.quantidade}</span>
                                </li>
                              ))
                            ) : (
                              <li className="italic text-gray-500 text-sm md:text-base">Nenhum item nesta gaveta.</li>
                            )}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Nenhuma gaveta foi encontrada nesse carrinho.</p>
                    )}
                  </div>
                </>
              )}

              {/* Botões dentro de cada carrinho */}
              <div className="flex-grow flex flex-col sm:flex-row items-end justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowEstoqueGlobal(!showEstoqueGlobal)}
                  className={`${showEstoqueGlobal ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out cursor-pointer text-sm w-full sm:w-auto`}
                >
                  {showEstoqueGlobal ? 'Ocultar Estoque' : 'Mostrar Estoque'}
                </button>

                <button
                  onClick={() => handleDeleteCarrinho(carrinho.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out text-sm w-full sm:w-auto cursor-pointer"
                >
                  Excluir Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarrinhoPage;