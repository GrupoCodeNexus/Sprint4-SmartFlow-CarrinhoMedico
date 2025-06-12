import React, { useState } from 'react';
import axios from 'axios';

const CarrinhoForm = ({ onCarrinhoCreated }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [status, setStatus] = useState('aberto');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await axios.post("http://localhost:3001/carrinhos", { nome, localizacao, status });
      setMessage('Carrinho criado com sucesso!');
      setNome('');
      setLocalizacao('');
      setStatus('aberto');
      if (onCarrinhoCreated) {
        onCarrinhoCreated();
      }
    } catch (error) {
      console.error('Erro ao criar carrinho:', error);
      setMessage('Erro ao criar carrinho. Verifique o console.');
      setIsError(true);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-6">
      <h2 className="text-xl font-bold mb-4">Criar Novo Carrinho</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Carrinho:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">Localização:</label>
          <input
            type="text"
            id="localizacao"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
            <option value="estoque">Estoque</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 cursor-pointer"
        >
          Criar Carrinho
        </button>
        {message && (
          <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default CarrinhoForm;
