import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = (e) => {
    e.preventDefault();
    // Simula armazenamento local (ou envie a API)
    if (email && senha) {
      // Salve no localStorage
      localStorage.setItem('usuario', JSON.stringify({ email, senha }));
      navigate('/login');
    } else {
      setErro('Preencha email e senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleCadastro} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Cadastrar</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="w-full p-2 border rounded" required />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Cadastrar</button>
        <p className="text-center text-sm">
          Já tem conta? <Link to="/login" className="text-blue-500">Faça login</Link>
        </p>
      </form>
    </div>
  );
}
