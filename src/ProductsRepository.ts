import { ResultSetHeader } from "mysql2"
import { conn } from "./db"
import { Product } from "./product"
import redisClient from "./redis"


export class ProductsRepository {
  
  async loadCache() {
    return new Promise<void>((resolve, reject) => {
      conn.query<Product[]>("SELECT id, name, price, description FROM PRODUCTS", async (err, results) => {
        if (err) return reject(err);
        try {
          for (const result of results) {
            if (result.id) {
              console.log(`Definindo cache para ID: ${result.id}`);
              await redisClient.set(`product:${result.id}`, JSON.stringify(result));
            } else {
              console.warn('ID ausente no resultado:', result);
            }
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  

  async getAll(): Promise<Product[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const keys = await redisClient.keys('product:*');
        const products: Product[] = [];
  
        for (const key of keys) {
          const productData = await redisClient.get(key);
          if (productData) {
            products.push(JSON.parse(productData));
          }
        }
        console.log('Retornando todos os produtos do cache');
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  }


  //funcionando
  async getById(id: number): Promise<Product | null> {
    return new Promise(async (resolve, reject) => {
      const cachedProduct = await redisClient.get(`product:${id}`);
      if (cachedProduct) {
        console.log('retornando do cache');
        return resolve (JSON.parse(cachedProduct));
      }
      conn.query<Product[]>(
        "SELECT * FROM PRODUCTS WHERE id = ?",
        [id],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          const product = results?.[0];
          
          if (product) {
            redisClient.set(`product:${id}`, JSON.stringify(product));
          }
          console.log('retornando do banco');
          resolve(product);
        }
      );
    });

  }


  //funcionando
  async create(p: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "INSERT INTO PRODUCTS (name, price, description) VALUES(?,?,?)",
        [p.name, p.price, p.description],
        async (err, res) => {
          if (err) return reject(err);
            const idKey = res.insertId;
            const product = { id: idKey, name: p.name, price: p.price, description: p.description } as Product;
  
            await redisClient.set(`product:${idKey}`, JSON.stringify(product));
            resolve(product);
            console.log('Produto inserido no banco e no cache individual');
          }
      );
    });
  }

  async update(p: Product): Promise<Product | undefined> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "UPDATE PRODUCTS SET name = ?, price = ?, description = ? WHERE id = ?",
        [p.name, p.price, p.description, p.id],
        async (err, res) => {
          if (err) {
            return reject(err);
          }
          try {
            if (p) {
              await redisClient.set(`product:${p.id}`, JSON.stringify(p));
              resolve(p);
            } else {
              reject(new Error('Product not found after update'));
            }
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  delete(product_id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "DELETE FROM PRODUCTS WHERE id = ?",
        [product_id],
        async (err, res) => {
          if (err) reject(err)
          await redisClient.del(`product:${product_id}`);
          resolve(res as any);
        }
      );
    })
  }

}