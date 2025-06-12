import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario?.email === email && usuario.senha === senha) {
      // Login bem-sucedido: redireciona para /estoque
      navigate('/estoque');
    } else {
      setErro('Email ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Entrar</button>
        <p className="text-center text-sm mt-4">
          Não tem conta? <Link to="/cadastro" className="text-green-500">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
