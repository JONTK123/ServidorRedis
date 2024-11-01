import { ResultSetHeader } from "mysql2"; // Importa ResultSetHeader para lidar com o cabeçalho dos resultados de inserção e atualização.
import { conn } from "./db"; // Importa a conexão com o banco de dados.
import { Product } from "./product"; // Importa a interface Product que define a estrutura de um produto.
import redisClient from "./redis"; // Importa o cliente Redis para operações de cache.


export class ProductsRepository {
  
  // Carrega todos os produtos do banco de dados e os armazena no cache Redis.
  async loadCache() {
    return new Promise<void>((resolve, reject) => {
      conn.query<Product[]>("SELECT id, name, price, description FROM PRODUCTS", async (err, results) => {
        if (err) return reject(err); // Trata erros da consulta ao banco de dados.
        try {
          // Itera sobre os resultados e armazena cada produto no cache.
          for (const result of results) {
            if (result.id) {
              console.log(`Definindo cache para ID: ${result.id}`);
              await redisClient.set(`product:${result.id}`, JSON.stringify(result)); // Define o cache no Redis.
            } else {
              console.warn('ID ausente no resultado:', result); // Alerta se o ID estiver ausente.
            }
          }
          resolve(); // Resolve a promessa após carregar todos os produtos.
        } catch (error) {
          reject(error); // Trata erros durante o armazenamento no cache.
        }
      });
    });
  }
  
  // Recupera todos os produtos do cache Redis.
  async getAll(): Promise<Product[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const keys = await redisClient.keys('product:*'); // Obtém todas as chaves de produtos do cache.
        const products: Product[] = []; // Inicializa um array para armazenar produtos.
  
        // Itera sobre as chaves e recupera os dados de cada produto do cache.
        for (const key of keys) {
          const productData = await redisClient.get(key);
          if (productData) {
            products.push(JSON.parse(productData)); // Adiciona o produto ao array após fazer o parse.
          }
        }
        console.log('Retornando todos os produtos do cache');
        resolve(products); // Resolve a promessa com a lista de produtos.
      } catch (error) {
        reject(error); // Trata erros na recuperação do cache.
      }
    });
  }

  // Recupera um produto específico pelo ID, primeiro tentando no cache.
  async getById(id: number): Promise<Product | null> {
    return new Promise(async (resolve, reject) => {
      const cachedProduct = await redisClient.get(`product:${id}`); // Tenta obter o produto do cache.
      if (cachedProduct) {
        console.log('retornando do cache');
        return resolve(JSON.parse(cachedProduct)); // Retorna o produto do cache.
      }
      conn.query<Product[]>( // Consulta ao banco de dados se o produto não estiver no cache.
        "SELECT * FROM PRODUCTS WHERE id = ?",
        [id],
        (err, results) => {
          if (err) {
            return reject(err); // Trata erros da consulta.
          }
          const product = results?.[0]; // Obtém o primeiro resultado.
          
          if (product) {
            redisClient.set(`product:${id}`, JSON.stringify(product)); // Armazena o produto no cache.
          }
          console.log('retornando do banco');
          resolve(product); // Resolve a promessa com o produto encontrado.
        }
      );
    });
  }

  // Cria um novo produto e o armazena no banco de dados e no cache.
  async create(p: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>( // Insere o produto no banco de dados.
        "INSERT INTO PRODUCTS (name, price, description) VALUES(?,?,?)",
        [p.name, p.price, p.description],
        async (err, res) => {
          if (err) return reject(err); // Trata erros da inserção.
          const idKey = res.insertId; // Obtém o ID do novo produto.
          const product = { id: idKey, name: p.name, price: p.price, description: p.description } as Product; // Cria um objeto do produto.
  
          await redisClient.set(`product:${idKey}`, JSON.stringify(product)); // Armazena o produto no cache.
          resolve(product); // Resolve a promessa com o novo produto.
          console.log('Produto inserido no banco e no cache individual');
        }
      );
    });
  }

  // Atualiza um produto existente no banco de dados e no cache.
  async update(p: Product): Promise<Product | undefined> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>( // Atualiza os dados do produto.
        "UPDATE PRODUCTS SET name = ?, price = ?, description = ? WHERE id = ?",
        [p.name, p.price, p.description, p.id],
        async (err, res) => {
          if (err) {
            return reject(err); // Trata erros da atualização.
          }
          try {
            if (p) {
              await redisClient.set(`product:${p.id}`, JSON.stringify(p)); // Atualiza o cache com os novos dados.
              resolve(p); // Resolve a promessa com o produto atualizado.
            } else {
              reject(new Error('Product not found after update')); // Trata caso o produto não exista.
            }
          } catch (error) {
            reject(error); // Trata erros durante a atualização do cache.
          }
        }
      );
    });
  }

  // Remove um produto do banco de dados e do cache.
  async delete(product_id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>( // Remove o produto do banco de dados.
        "DELETE FROM PRODUCTS WHERE id = ?",
        [product_id],
        async (err, res) => {
          if (err) reject(err) // Trata erros da remoção.
          await redisClient.del(`product:${product_id}`); // Remove o produto do cache.
          resolve(res as any); // Resolve a promessa com o resultado da remoção.
        }
      );
    });
  }

  // Fecha as conexões com o banco de dados MySQL e Redis.
  async close(callback: () => void) {
    try {
        await new Promise((resolve, reject) => {
            conn.end(err => { // Encerra a conexão com o MySQL.
                if (err) {
                    console.error('Erro ao encerrar conexão com o MySQL:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
        
        await redisClient.quit(); // Encerra a conexão com o Redis.
        console.log('Conexões com o banco de dados e Redis encerradas.');
        callback(); // Chama o callback após o encerramento.
    } catch (error) {
        console.error('Erro ao encerrar conexões:', error);
        callback(); // Chama o callback mesmo em caso de erro.
    }
  }
}
