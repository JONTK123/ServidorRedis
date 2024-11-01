import express from "express";
import { Request, Response, Router } from "express";
import {ProductsRepository} from "./ProductsRepository";
import {Product } from "./product";

const app = express();
const port = 3000;
const routes = Router();

app.use(express.json());

const productsRepo = new ProductsRepository();

try{
    productsRepo.loadCache();
    console.log('Dados carregados com sucesso parao redis!');
}catch(err){
    console.log('Erro ao carregar dados para o redis', err);
}

routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 200;
    res.send("Funcionando...");
});

routes.post('/addProduct', async(req: Request, res: Response)=>{
    // adicionar um produto.
    const { name, price, description } = req.body;
    const newProduct: Product = { name, price, description } as Product;

    const product = await productsRepo.create(newProduct);
    res.statusCode = 200;
    res.type('application/json');
    res.send(product);
});

routes.delete('/deleteProduct/:id', async(req: Request, res: Response)=>{
    // deletar um produto.
    const id = parseInt(req.params.id);
    const product = await productsRepo.delete(id);
    res.type('application/json');
    res.sendStatus(200);
});

routes.put('/updateProduct', async(req: Request, res: Response)=>{
    // atualizar um produto.
    const { id, name, price, description } = req.body;
    const newProduct: Product= { id, name, price, description } as Product;
    
    const product = await productsRepo.update(newProduct);
    res.statusCode = 200;
    res.type('application/json');
    res.send(product);
});

routes.get('/getAllProducts', async(req: Request, res: Response)=>{
    // obter todos os produtos.
    const products = await productsRepo.getAll();
    res.statusCode = 200; 
    res.type('application/json')
    res.send(products);
});

routes.get('/getProductID/:id', async(req: Request, res: Response)=>{
    //get por id.
    const id = parseInt(req.params.id);
    const product = await productsRepo.getById(id);
    res.statusCode = 200;
    res.type('application/json'); //já interpretar o tipo da resposta como um json.
    res.send(product);
});

// aplicar as rotas na aplicação web backend. 
app.use(routes);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});