import mysql, { ConnectionOptions } from 'mysql2'; // Importa a biblioteca mysql2 e o tipo ConnectionOptions
import dotenv from 'dotenv'; // Importa a biblioteca dotenv para carregar variáveis de ambiente

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Define as opções de conexão com o MySQL
const access: ConnectionOptions = {
    host: process.env.MYSQL_HOST, // Endereço do host MySQL, definido em variáveis de ambiente
    user: process.env.MYSQL_USER, // Nome do usuário MySQL, definido em variáveis de ambiente
    password: process.env.MYSQL_PASSWORD, // Senha do usuário MySQL, definida em variáveis de ambiente
    database: process.env.MYSQL_DATABASE // Nome do banco de dados, definido em variáveis de ambiente
};

// Cria e exporta a conexão com o MySQL usando as opções definidas
export const conn = mysql.createConnection(access);
