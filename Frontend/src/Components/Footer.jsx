import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Gerenciador de Carrinhos.</p>
      </div>
    </footer>
  );
};

export default Footer;