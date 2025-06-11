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
async function readData(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // Arquivo não encontrado
            console.warn(`Arquivo não encontrado em: ${filePath}. Criando arquivo vazio.`);
            // Para estoquePadrao, o default pode ser um objeto vazio com gavetas.
            // Para carrinhos, o default é um array vazio.
            const defaultContent = (filePath === ESTOQUE_PADRAO_FILE) ? { gavetas: [] } : [];
            await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
            return defaultContent;
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
    const { nome, localizacao, status = "estoque" } = req.body; // Adicionado status com valor padrão
    if (!nome || !localizacao) {
        return res.status(400).json({ message: "Nome e localização são obrigatórios para criar um carrinho." });
    }

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        // Garante que o estoque padrão existe e tem a estrutura esperada
        const estoquePadrao = await readData(ESTOQUE_PADRAO_FILE);

        // Se o estoque padrão não tiver a propriedade 'gavetas' ou for nulo, inicialize
        const gavetasDoEstoquePadrao = (estoquePadrao && Array.isArray(estoquePadrao.gavetas))
            ? estoquePadrao.gavetas
            : [];

        const novoCarrinho = {
            id: `CAR-${Date.now()}`, // ID único baseado no timestamp
            nome,
            localizacao,
            status, // Incluído o status ao criar o carrinho
            // Clonar o estoque padrão para evitar que futuras alterações no padrão afetem carrinhos já criados
            // A menos que a intenção seja que sempre reflitam o padrão, o que é o caso da PUT /estoque-padrao.
            // Aqui, ele só usa o padrão no momento da CRIAÇÃO.
            gavetas: JSON.parse(JSON.stringify(gavetasDoEstoquePadrao)),
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
// Este PUT substitui o recurso, mas estamos adicionando o PATCH para atualizações parciais
app.put('/carrinhos/:id', async (req, res) => {
    const carrinhoId = req.params.id;
    const { nome, localizacao, status, gavetas, acessos } = req.body; // Permite atualizar todos os campos

    try {
        const carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex !== -1) {
            // Cria um novo objeto de carrinho com os dados atualizados
            carrinhos[carrinhoIndex] = {
                ...carrinhos[carrinhoIndex], // Mantém os campos existentes
                ...(nome && { nome }),
                ...(localizacao && { localizacao }),
                ...(status && { status }),
                ...(gavetas && { gavetas }),
                ...(acessos && { acessos })
            };
            await writeData(CARRINHOS_FILE, carrinhos);
            res.json(carrinhos[carrinhoIndex]);
        } else {
            res.status(404).json({ message: "Carrinho não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao editar carrinho", error: error.message });
    }
});

// NOVA ROTA: ROTA - PATCH - Atualizar campos específicos de um carrinho (incluindo status)
app.patch('/carrinhos/:id', async (req, res) => {
    const carrinhoId = req.params.id;
    const updates = req.body; // Corpo da requisição com os campos a serem atualizados (ex: { status: "aberto" })

    // Validação básica para garantir que há algo para atualizar
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        let carrinhos = await readData(CARRINHOS_FILE);
        const carrinhoIndex = carrinhos.findIndex(c => c.id === carrinhoId);

        if (carrinhoIndex === -1) {
            return res.status(404).json({ message: 'Carrinho não encontrado.' });
        }

        // Aplica as atualizações ao carrinho existente
        carrinhos[carrinhoIndex] = { ...carrinhos[carrinhoIndex], ...updates };

        await writeData(CARRINHOS_FILE, carrinhos);
        res.json(carrinhos[carrinhoIndex]); // Retorna o carrinho atualizado
    } catch (error) {
        console.error('Erro ao atualizar status do carrinho (PATCH):', error);
        res.status(500).json({ message: 'Erro ao atualizar o carrinho', error: error.message });
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
        // Assume que readData para ESTOQUE_PADRAO_FILE retornará { gavetas: [] } se não existir
        const estoquePadrao = await readData(ESTOQUE_PADRAO_FILE);
        res.json(estoquePadrao);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar o estoque padrão", error: error.message });
    }
});

// ROTA - PUT - Editar o estoque padrão E ATUALIZAR TODOS OS CARRINHOS EXISTENTES
app.put('/estoque-padrao', async (req, res) => {
    const novoEstoquePadrao = req.body;
    if (!novoEstoquePadrao || !novoEstoquePadrao.gavetas || !Array.isArray(novoEstoquePadrao.gavetas)) {
        return res.status(400).json({ message: "Formato inválido para o estoque padrão. Espera-se um objeto com uma propriedade 'gavetas' (array)." });
    }

    try {
        // 1. Salvar o novo estoque padrão
        await writeData(ESTOQUE_PADRAO_FILE, novoEstoquePadrao);

        // 2. Carregar todos os carrinhos existentes
        let carrinhos = await readData(CARRINHOS_FILE);

        // 3. Iterar sobre cada carrinho e atualizar a quantidade de seus itens
        carrinhos = carrinhos.map(carrinho => {
            const updatedGavetas = carrinho.gavetas.map(gaveta => {
                // Encontrar a gaveta correspondente no novo estoque padrão pelo nome
                const gavetaPadrao = novoEstoquePadrao.gavetas.find(
                    gp => gp.nome === gaveta.nome
                );

                if (gavetaPadrao) {
                    // Se a gaveta existe no padrão, atualize seus itens
                    const updatedItens = gaveta.itens.map(item => {
                        // Encontrar o item correspondente na gaveta padrão pelo nome
                        const itemPadrao = gavetaPadrao.itens.find(
                            ip => ip.nome === item.nome
                        );

                        if (itemPadrao) {
                            // Atualiza a quantidade do item para o valor do estoque padrão
                            return { ...item, quantidade: itemPadrao.quantidade };
                        }
                        return item; // Retorna o item original se não encontrado no padrão
                    });
                    return { ...gaveta, itens: updatedItens };
                }
                return gaveta; // Retorna a gaveta original se não encontrada no padrão
            });
            return { ...carrinho, gavetas: updatedGavetas };
        });

        // 4. Salvar os carrinhos atualizados
        await writeData(CARRINHOS_FILE, carrinhos);

        res.json({ message: "Estoque padrão e todos os carrinhos atualizados com sucesso!", novoEstoquePadrao });
    } catch (error) {
        console.error('Erro ao atualizar estoque padrão e carrinhos:', error);
        res.status(500).json({ message: "Erro ao atualizar o estoque padrão e carrinhos", error: error.message });
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