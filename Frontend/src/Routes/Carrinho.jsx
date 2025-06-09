import React, { useEffect, useState } from 'react';

const Carrinho = () => {
  const [carrinhos, setCarrinhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarrinhos = async () => {
      try {
        const response = await fetch('http://localhost:3001/carrinhos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCarrinhos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrinhos();
  }, []);

  if (loading) {
    return <div>Loading carrinhos...</div>;
  }

  if (error) {
    return <div>Error loading carrinhos: {error}</div>;
  }

  return (
    <div className="carrinho-container">
      <h1>Carrinhos de Emergência</h1>
      {carrinhos.length === 0 ? (
        <p>Nenhum carrinho foi cadastrado. Por favor crie um.</p>
      ) : (
        <div className="carrinhos-list">
          {carrinhos.map((carrinho) => (
            <div key={carrinho.id} className="carrinho-card">
              <h2>{carrinho.nome}</h2>
              <p><strong>Location:</strong> {carrinho.localizacao}</p>
              <h3>Drawers:</h3>
              <div className="gavetas-list">
                {carrinho.gavetas && carrinho.gavetas.length > 0 ? (
                  carrinho.gavetas.map((gaveta) => (
                    <div key={gaveta.id} className="gaveta-card">
                      <h4>{gaveta.nome}</h4>
                      <ul>
                        {gaveta.itens && gaveta.itens.length > 0 ? (
                          gaveta.itens.map((item) => (
                            <li key={item.id}>
                              {item.nome} - Quantidade: {item.quantidade}
                            </li>
                          ))
                        ) : (
                          <li>Nenhum item nessa gaveta.</li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma gaveta foi encontrada nesse carrinho</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carrinho;