const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs').promises; // Usar fs.promises para operações assíncronas com arquivos
const app = express()
const PORT = 3001; // Porta do servidor

// Caminhos dos arquivos de dados
const CARRINHOS_FILE = path.join(__dirname, 'data', 'carrinhos.json');
const ESTOQUE_PADRAO_FILE = path.join(__dirname, 'data', 'estoquePadrao.json');

// Middleware para permitir que o frontend acesse o servidor backend em diferentes domínios
app.use(cors());
// Middleware para verificar se o corpo das requisições estão como JSON.
app.use(express.json());

// Middleware para servir arquivos estáticos (opcional, se você tiver uma pasta 'public')
app.use(express.static('public'));

// --- Funções de Leitura e Escrita de Arquivos ---
async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // Arquivo não encontrado
            console.warn(`Arquivo não encontrado em: ${filePath}. Criando arquivo vazio.`);
            await fs.writeFile(filePath, '[]', 'utf8');
            return [];
        }
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        throw new Error(`Erro ao ler dados de ${filePath}`);
    }
}

async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
        throw new Error(`Erro ao salvar dados em ${filePath}`);
    }
}

// --- Rotas de Carrinhos ---

// ROTA - GET - Buscar todos os carrinhos
app.get('/carrinhos', async (req, res) => {
    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        res.json(carrinhos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar os carrinhos", error: error.message });
    }
});

// ROTA - GET - Buscar um carrinho específico por ID
app.get('/carrinhos/:id', async (req, res) => {
    const carrinhoId = req.params.id;
    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinho = carrinhos.find(c => c.id === carrinhoId);
        if (carrinho) {
            res.json(carrinho);
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar o carrinho", error: error.message });
    }
});

// ROTA - POST - Criar um novo carrinho
app.post('/carrinhos', async (req, res) => {
    const { nome, localizacao } = req.body;
    if (!nome || !localizacao) {
        return res.status(400).json({ message: "Nome e localização são obrigatórios para criar um carrinho." });
    }

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const estoquePadrao = await readData(ESTOQUE_PADRAO_FILE);

        const novoCarrinho = {
            id: `CAR-${Date.now()}`, // ID único baseado no timestamp
            nome,
            localizacao,
            gavetas: JSON.parse(JSON.stringify(estoquePadrao.gavetas)), // Clonar o estoque padrão
            acessos: [] // Inicialmente sem acessos definidos
        };

        carrinhos.push(novoCarrinho);
        await writeData(CARRINHOS_FILE, carrinhos);
        res.status(201).json(novoCarrinho);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar carrinho", error: error.message });
    }
});

// ROTA - PUT - Editar um carrinho (ex: nome, localização)
app.put('/carrinhos/:id', async (req, res) => {
    const carrinhoId = req.params.id;
    const { nome, localizacao } = req.body;

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex !== -1) {
            if (nome) carrinhos[carrinhoIndex].nome = nome;
            if (localizacao) carrinhos[carrinhoIndex].localizacao = localizacao;

            await writeData(CARRINHOS_FILE, carrinhos);
            res.json(carrinhos[carrinhoIndex]);
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao editar carrinho", error: error.message });
    }
});

// ROTA - DELETE - Excluir um carrinho
app.delete('/carrinhos/:id', async (req, res) => {
    const carrinhoId = req.params.id;
    try {
        let carrinhos = await readData(CARRINHOS_FILE);
        const initialLength = carrinhos.length;
        carrinhos = carrinhos.filter(c => c.id !== carrinhoId);

        if (carrinhos.length < initialLength) {
            await writeData(CARRINHOS_FILE, carrinhos);
            res.status(200).json({ message: "Carrinho excluído com sucesso" });
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir carrinho", error: error.message });
    }
});

// --- Rotas de Estoque Padrão ---

// ROTA - GET - Obter o estoque padrão
app.get('/estoque-padrao', async (req, res) => {
    try {
        const estoquePadrao = await readData(ESTOQUE_PADRAO_FILE);
        res.json(estoquePadrao);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar o estoque padrão", error: error.message });
    }
});

// ROTA - PUT - Editar o estoque padrão sobrescreve o estoque padrão.
// Ao alterar o estoque padrão, os NOVOS carrinhos terão este novo padrão.

app.put('/estoque-padrao', async (req, res) => {
    const novoEstoquePadrao = req.body;
    if (!novoEstoquePadrao || !novoEstoquePadrao.gavetas || !Array.isArray(novoEstoquePadrao.gavetas)) {
        return res.status(400).json({ message: "Formato inválido para o estoque padrão. Espera-se um objeto com uma propriedade 'gavetas' (array)." });
    }

    try {
        await writeData(ESTOQUE_PADRAO_FILE, novoEstoquePadrao);
        res.json({ message: "Estoque padrão atualizado com sucesso!", novoEstoquePadrao });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar o estoque padrão", error: error.message });
    }
});

// --- Rotas de Acesso ao Carrinho ---

// ROTA - GET - Obter acessos de um carrinho
app.get('/carrinhos/:carrinhoId/acessos', async (req, res) => {
    const carrinhoId = req.params.carrinhoId;
    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinho = carrinhos.find(c => c.id === carrinhoId);

        if (carrinho) {
            res.json(carrinho.acessos || []);
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar acessos do carrinho", error: error.message });
    }
});

// ROTA - POST - Adicionar acesso a um carrinho
app.post('/carrinhos/:carrinhoId/acessos', async (req, res) => {
    const carrinhoId = req.params.carrinhoId;
    const { usuarioId, permissao } = req.body; // Ex: permissao: "leitura", "escrita"

    if (!usuarioId || !permissao) {
        return res.status(400).json({ message: "ID do usuário e permissão são obrigatórios." });
    }

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex !== -1) {
            const carrinho = carrinhos[carrinhoIndex];
            if (!carrinho.acessos) {
                carrinho.acessos = [];
            }
            // Evitar acessos duplicados para o mesmo usuário
            const existingAccess = carrinho.acessos.find(a => a.usuarioId === usuarioId);
            if (existingAccess) {
                return res.status(409).json({ message: "Usuário já possui acesso a este carrinho." });
            }

            carrinho.acessos.push({ usuarioId, permissao, adicionadoEm: new Date().toISOString() });
            await writeData(CARRINHOS_FILE, carrinhos);
            res.status(201).json({ message: "Acesso adicionado com sucesso", acesso: { usuarioId, permissao } });
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar acesso", error: error.message });
    }
});

// ROTA - PUT - Editar acesso a um carrinho
app.put('/carrinhos/:carrinhoId/acessos/:usuarioId', async (req, res) => {
    const { carrinhoId, usuarioId } = req.params;
    const { permissao } = req.body;

    if (!permissao) {
        return res.status(400).json({ message: "Permissão é obrigatória para editar o acesso." });
    }

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex !== -1) {
            const carrinho = carrinhos[carrinhoIndex];
            const acessoIndex = carrinho.acessos ? carrinho.acessos.findIndex(a => a.usuarioId === usuarioId) : -1;

            if (acessoIndex !== -1) {
                carrinho.acessos[acessoIndex].permissao = permissao;
                await writeData(CARRINHOS_FILE, carrinhos);
                res.json({ message: "Acesso atualizado com sucesso", acesso: carrinho.acessos[acessoIndex] });
            } else {
                res.status(404).json({ message: "Acesso do usuário não encontrado para este carrinho" });
            }
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao editar acesso", error: error.message });
    }
});

// ROTA - DELETE - Excluir acesso de um carrinho
app.delete('/carrinhos/:carrinhoId/acessos/:usuarioId', async (req, res) => {
    const { carrinhoId, usuarioId } = req.params;

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex !== -1) {
            const carrinho = carrinhos[carrinhoIndex];
            const initialAccessLength = carrinho.acessos ? carrinho.acessos.length : 0;
            carrinho.acessos = carrinho.acessos ? carrinho.acessos.filter(a => a.usuarioId !== usuarioId) : [];

            if (carrinho.acessos.length < initialAccessLength) {
                await writeData(CARRINHOS_FILE, carrinhos);
                res.status(200).json({ message: "Acesso excluído com sucesso" });
            } else {
                res.status(404).json({ message: "Acesso do usuário não encontrado para este carrinho" });
            }
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir acesso", error: error.message });
    }
});

// --- Rodar o servidor backend ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em http://localhost:${PORT}`);
});