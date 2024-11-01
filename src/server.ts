import express from "express"; // Importa a biblioteca Express
import { Request, Response, Router } from "express"; // Importa tipos Request, Response e Router do Express
import { ProductsRepository } from "./ProductsRepository"; // Importa a classe ProductsRepository
import { Product } from "./product"; // Importa a interface Product

// Cria uma instância do aplicativo Express
const app = express();
const port = 3000; // Define a porta do servidor
const routes = Router(); // Cria um objeto Router para gerenciar as rotas

app.use(express.json()); // Middleware para analisar JSON no corpo das requisições

// Cria uma instância de ProductsRepository
const productsRepo = new ProductsRepository();

// Carrega os dados do banco de dados para o Redis no início do servidor
try {
    productsRepo.loadCache();
    console.log('Dados carregados com sucesso para o redis!');
} catch (err) {
    console.log('Erro ao carregar dados para o redis', err);
}

// Rota raiz que retorna uma mensagem simples
routes.get('/', (req: Request, res: Response) => {
    res.statusCode = 200; // Define o código de status HTTP como 200 (OK)
    res.send("Funcionando..."); // Envia uma resposta simples
});

// Rota para adicionar um novo produto
routes.post('/addProduct', async (req: Request, res: Response) => {
    const { name, price, description } = req.body; // Extrai os dados do produto do corpo da requisição
    const newProduct: Product = { name, price, description } as Product; // Cria um novo objeto Product

    const product = await productsRepo.create(newProduct); // Chama o método create do repositório
    res.statusCode = 200; // Define o código de status HTTP como 200 (OK)
    res.type('application/json'); // Define o tipo da resposta como JSON
    res.send(product); // Envia o produto recém-criado como resposta
});

// Rota para deletar um produto pelo ID
routes.delete('/deleteProduct/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id); // Extrai o ID da URL e o converte para um número
    await productsRepo.delete(id); // Chama o método delete do repositório
    res.type('application/json'); // Define o tipo da resposta como JSON
    res.sendStatus(200); // Envia uma resposta com código de status 200 (OK)
});

// Rota para atualizar um produto
routes.put('/updateProduct', async (req: Request, res: Response) => {
    const { id, name, price, description } = req.body; // Extrai os dados do produto do corpo da requisição
    const newProduct: Product = { id, name, price, description } as Product; // Cria um novo objeto Product

    const product = await productsRepo.update(newProduct); // Chama o método update do repositório
    res.statusCode = 200; // Define o código de status HTTP como 200 (OK)
    res.type('application/json'); // Define o tipo da resposta como JSON
    res.send(product); // Envia o produto atualizado como resposta
});

// Rota para obter todos os produtos
routes.get('/getAllProducts', async (req: Request, res: Response) => {
    const products = await productsRepo.getAll(); // Chama o método getAll do repositório
    res.statusCode = 200; // Define o código de status HTTP como 200 (OK)
    res.type('application/json'); // Define o tipo da resposta como JSON
    res.send(products); // Envia a lista de produtos como resposta
});

// Rota para obter um produto pelo ID
routes.get('/getProductID/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id); // Extrai o ID da URL e o converte para um número
    const product = await productsRepo.getById(id); // Chama o método getById do repositório
    res.statusCode = 200; // Define o código de status HTTP como 200 (OK)
    res.type('application/json'); // Define o tipo da resposta como JSON
    res.send(product); // Envia o produto encontrado como resposta
});

// Rota para desligar o servidor
routes.post('/shutdown', (req: Request, res: Response) => {
    res.status(200).send('Servidor desligando...'); // Envia uma mensagem indicando que o servidor está desligando

    // Fecha as conexões com o banco de dados e Redis
    productsRepo.close(() => {
        console.log('Conexões com o banco de dados e Redis encerradas.');
    });
});

// Aplica as rotas definidas no aplicativo Express
app.use(routes);

// Inicia o servidor e escuta na porta especificada
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Loga a mensagem indicando que o servidor está rodando
});
