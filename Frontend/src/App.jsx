import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import CarrinhoPage from './Routes/Carrinho'; 
import EstoquePage from './Routes/Estoque';   
import LoginPage from './Routes/Login';
import CadastroPage from './Routes/Cadastro';     
import ErrorPage from './Routes/Error';   
import StatusCarrinhos from './Routes/LocalCarrinho';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<CarrinhoPage />} />
            <Route path="/carrinhos" element={<CarrinhoPage />} />
            <Route path="/local" element={<StatusCarrinhos />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="*" element={<ErrorPage />} /> 
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;