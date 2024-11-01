import { createClient } from 'redis'; // Importa a função createClient da biblioteca redis

// Cria um cliente Redis configurando a URL de conexão
const redisClient = createClient({
    url: 'redis://localhost:6379' // URL padrão para o Redis rodando localmente na porta 6379
});

// Registra um manipulador de eventos para erros do cliente Redis
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Registra um manipulador de eventos quando o cliente Redis se conecta
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Registra um manipulador de eventos quando o cliente Redis está pronto para uso
redisClient.on('ready', () => console.log('Redis Client Ready'));

// Registra um manipulador de eventos quando o cliente Redis é desconectado
redisClient.on('end', () => console.log('Redis Client Disconnected'));

// Conecta o cliente Redis ao servidor
redisClient.connect();

// Exporta o cliente Redis para uso em outros módulos
export default redisClient;
