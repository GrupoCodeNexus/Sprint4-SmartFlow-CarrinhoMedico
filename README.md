# Sistema de Gerenciamento de Carrinhos de Emergência 🏥

Este projeto é uma solução abrangente para o gerenciamento de carrinhos de emergência dentro do Hospital Infantil Sabará, oferecendo funcionalidades para acompanhamento de status por andar, 
criação de novos carrinhos, e manutenção de um estoque padrão que pode ser replicado e atualizado nos carrinhos existentes.

## 🌟 Funcionalidades Principais:

### 1. Gerenciamento de Carrinhos (`CarrinhoPage` Componente)

* **Listagem de Carrinhos:** Exibe uma lista de todos os carrinhos cadastrados, com seus respectivos nomes e localizações.
* **Cadastro de Novos Carrinhos:** Permite adicionar novos carrinhos ao sistema, com opções para definir seu nome e localização (andar). Novos carrinhos são inicializados com o estoque padrão definido.
* **Exclusão de Carrinhos:** Funcionalidade para remover carrinhos do sistema.
* **Visualização Detalhada do Estoque:** Para cada carrinho listado, é possível expandir/ocultar a visualização de suas gavetas e itens, permitindo uma inspeção granular do conteúdo do carrinho.
* **Alternar Visibilidade do Estoque:** Um botão global permite ocultar ou mostrar o estoque de todos os carrinhos de uma vez para uma visão mais limpa da lista.

### 2. Gerenciamento do Estoque Padrão (`EstoquePage` Componente)

* **Definição do Estoque Padrão:** Permite configurar um modelo de estoque que será aplicado a **novos carrinhos** criados.
* **Estrutura de Gavetas e Itens:** O estoque padrão é organizado em "gavetas", e cada gaveta contém uma lista de "itens" com nome e quantidade.
* **CRUD Completo para Estoque Padrão:**
    * **Criação:** Adicione novas gavetas e itens a elas.
    * **Leitura:** Visualize a estrutura completa do estoque padrão.
    * **Atualização:** Edite nomes de gavetas e itens, e ajuste as quantidades.
    * **Exclusão:** Remova gavetas inteiras ou itens individuais.
* **Sincronização com Carrinhos Existentes:** Ao salvar as alterações no estoque padrão, o sistema **automaticamente atualiza o estoque de todos os carrinhos existentes** para refletir essas mudanças, garantindo consistência e padronização.
* **Expansão/Colapso de Gavetas:** Cada gaveta pode ser expandida ou recolhida para uma melhor organização visual ao gerenciar o estoque padrão.

### 3. Visão Geral de Status por Andar (`StatusCarrinhos` Componente)

* **Visualização por Andar:** Exibe um grid fixo de 24 "slots", cada um representando um andar, proporcionando uma visão abrangente da distribuição dos carrinhos.
* **Status de Carrinhos:** Cada card de andar muda de cor conforme o status dos carrinhos associados a ele:
    * 🔴 **Vermelho (Aberto):** Carrinho em uso para emergência ou manutenção.
    * 🟢 **Verde (Fechado):** Carrinho completo e pronto para uso.
    * 🟡 **Amarelo (Estoque Incompleto):** Carrinho necessita reposição de itens.
    * ⚪ **Cinza (Andar Vazio):** Não há carrinho cadastrado para este andar.
* **Múltiplos Carrinhos por Andar:** Suporta o cadastro de mais de um carrinho por andar. A visualização do card do andar prioriza o status mais crítico (ex: um carrinho "Aberto" tornará o andar vermelho).
* **Rotação de Informações (Múltiplos Carrinhos):** Para andares com mais de um carrinho, o card rotaciona automaticamente a cada 5 segundos, exibindo o nome e o status de cada carrinho individualmente, permitindo uma inspeção detalhada sem a necessidade de cliques adicionais.
* **Atualização de Status por Clique:** Ao clicar em um card de andar, o status do carrinho atualmente exibido (ou o primeiro, se houver apenas um) é alternado ciclicamente entre `aberto`, `fechado` e `estoque`.
* **Legenda Interativa:** Uma coluna lateral dedicada fornece uma legenda clara para cada cor e status, facilitando a compreensão da interface.
* **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela, garantindo uma boa experiência em dispositivos variados.

## 💻 Tecnologias Utilizadas:

* **Frontend:** **React + VITE** - Para construir uma interface de usuário dinâmica e reativa.
* **Estilização:** **Tailwind CSS** - Garantindo um design moderno, limpo e responsivo.
* **Backend:** **json-server (Node.js)** - Para simular uma API RESTful simples e persistir os dados dos carrinhos e do estoque padrão em um arquivo `JSON`.
* **HTTP Client:** **Axios** - Para realizar requisições HTTP ao backend.

## Como instalar e rodar o projeto 🤔

**Pré-requisitos:**
* **[Node.js](https://nodejs.org/pt/download) instalado** (versão 14 ou superior recomendada)

Para a instalação e execução deste projeto, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_desse_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_desse_REPOSITORIO>
    ```

2. **Instale as dependência do backend:**
    * Instale as dependências do **backend**:
        ```bash
        cd backend
        npm install
        ```
    * Inicie o **NODE.js** :
        ```bash
        node server.js
        ```
        *OBS: O servidor estará rodando na porta `3001`.*

3.  **Configurar e Rodar o Frontend:**
    * Abra um **novo terminal** na raiz do projeto.
    * Instale as dependências do frontend:
        ```bash
        cd frontend
        npm install
        ```
    * Inicie a aplicação React:
        ```bash
        npm run dev
        ```
    * Após a execução, um link para a aplicação será exibido no terminal (geralmente `http://localhost:5173/`). Acesse-o no seu navegador.

## Links Úteis 🔗

* **Repositório do Projeto:** Clique aqui
* **Documentação React:** [https://react.dev/](https://react.dev/)
* **Documentação Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)


## Integrantes da Equipe CodeNexus

- Francisco Vargas [<img src="https://github.com/user-attachments/assets/35f89293-65ea-4f0a-a400-28a28b2bbabe" width="30px"/>
](https://github.com/Franciscov25) [<img src="https://github.com/user-attachments/assets/3cafe66c-26e2-4028-a27c-3872972f0284" width="30px"/>
](https://www.linkedin.com/in/franciscovargas7/)| RM: 560322
- Kayque Carvalho [<img src="https://github.com/user-attachments/assets/35f89293-65ea-4f0a-a400-28a28b2bbabe" width="30px"/>
](https://github.com/Kay-Carv) [<img src="https://github.com/user-attachments/assets/3cafe66c-26e2-4028-a27c-3872972f0284" width="30px"/>
](https://www.linkedin.com/in/kayque-carvalho-49a190283/)| RM: 561189
- Matheus Ikeda [<img src="https://github.com/user-attachments/assets/35f89293-65ea-4f0a-a400-28a28b2bbabe" width="30px"/>](https://github.com/Matheus-Eiki)
[<img src="https://github.com/user-attachments/assets/3cafe66c-26e2-4028-a27c-3872972f0284" width="30px"/>
](https://www.linkedin.com/in/matheus-e-ikeda-943889331/)| RM: 559483
- Marcelo Affonso [<img src="https://github.com/user-attachments/assets/35f89293-65ea-4f0a-a400-28a28b2bbabe" width="30px"/>](https://github.com/tenebres-cpu) [<img src="https://github.com/user-attachments/assets/3cafe66c-26e2-4028-a27c-3872972f0284" width="30px"/>](https://www.linkedin.com/in/marcelo-affonso-fonseca-899682333/)| RM: 559790

