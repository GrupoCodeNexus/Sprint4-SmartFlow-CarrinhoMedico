import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Gerenciador de Carrinhos</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/local" className="hover:text-blue-200">Localização</Link></li>
            <li><Link to="/carrinhos" className="hover:text-blue-200">Carrinhos</Link></li>
            <li><Link to="/estoque" className="hover:text-blue-200">Estoque Padrão</Link></li>
            <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;