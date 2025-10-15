# Servidor Redis com MySQL - Sistema de Gerenciamento de Produtos

## 📋 Índice
- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura e Estratégia de Cache](#arquitetura-e-estratégia-de-cache)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Exemplos de Uso](#exemplos-de-uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Estratégias de Sincronização](#estratégias-de-sincronização)
- [Troubleshooting](#troubleshooting)
- [Cenário de Uso Real](#cenário-de-uso-real)

## 🎯 Sobre o Projeto

Este projeto implementa um servidor backend que integra **Redis** como cache com **MySQL** como banco de dados relacional, desenvolvido para otimizar o desempenho de consultas em um sistema de gerenciamento de produtos. O cenário simula uma loja virtual onde milhares de usuários consultam produtos simultaneamente.

### Objetivo Principal
Demonstrar a implementação de uma estratégia de cache eficiente usando Redis para reduzir a carga no banco de dados e melhorar significativamente o tempo de resposta das consultas.

### Características Principais
- ✅ Cache automático de produtos no Redis
- ✅ Sincronização garantida entre MySQL e Redis
- ✅ Carregamento inicial do cache na inicialização do servidor
- ✅ API RESTful completa para operações CRUD
- ✅ Tratamento de erros e logs detalhados
- ✅ Código totalmente comentado em português

## 🛠 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista
- **MySQL** - Banco de dados relacional
- **Redis** - Cache em memória de alta performance
- **mysql2** - Cliente MySQL para Node.js
- **redis** - Cliente Redis oficial para Node.js
- **dotenv** - Gerenciamento de variáveis de ambiente
- **nodemon** - Monitor de alterações para desenvolvimento

## 🏗 Arquitetura e Estratégia de Cache

### Estratégia de Cache Implementada

O projeto implementa uma estratégia de **Cache-Aside (Lazy Loading)** com sincronização proativa:

1. **Carregamento Inicial**: Ao iniciar o servidor, todos os produtos do MySQL são carregados no Redis
2. **Leitura (Read)**: Todas as consultas são realizadas primeiro no cache Redis
3. **Escrita (Create)**: Novos produtos são salvos no MySQL e imediatamente armazenados no Redis
4. **Atualização (Update)**: Produtos são atualizados no MySQL e o cache é atualizado no Redis
5. **Exclusão (Delete)**: Produtos são removidos do MySQL e imediatamente removidos do Redis

### Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────┐   ┌──────────┐
│  Redis   │   │  MySQL   │
│  Cache   │   │    DB    │
└──────────┘   └──────────┘
```

### Vantagens da Estratégia

- **Performance**: Redução drástica no tempo de resposta das consultas
- **Escalabilidade**: Diminui a carga no banco de dados relacional
- **Disponibilidade**: Redis mantém os dados mais acessados sempre disponíveis
- **Consistência**: Sincronização garantida em todas as operações

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **MySQL** (versão 5.7 ou superior) - [Download](https://dev.mysql.com/downloads/)
- **Redis** (versão 6 ou superior) - [Download](https://redis.io/download/)
- **npm** ou **yarn** - Gerenciador de pacotes (vem com Node.js)

### Verificar Instalações

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar MySQL
mysql --version

# Verificar Redis
redis-server --version
```

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/JONTK123/ServidorRedis.git
cd ServidorRedis
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados MySQL

Execute o script SQL fornecido para criar o banco de dados e a tabela:

```bash
mysql -u root -p < DUMP.sql
```

Ou manualmente no MySQL Workbench ou outro cliente:

```sql
DROP DATABASE IF EXISTS mini_projeto_ebd2;
CREATE DATABASE mini_projeto_ebd2;

DROP TABLE IF EXISTS mini_projeto_ebd2.products;
CREATE TABLE mini_projeto_ebd2.products(
    ID INT not null primary key auto_increment,
    NAME varchar(50) not null,
    PRICE decimal(10,2) not null default 0,
    DESCRIPTION varchar(500) not null
);

-- Dados iniciais de exemplo
INSERT INTO mini_projeto_ebd2.products (NAME, PRICE, DESCRIPTION) 
VALUES ('ROLEX SUBMARINER', 12000, 'Descrição do relógio de pulso');

INSERT INTO mini_projeto_ebd2.products (NAME, PRICE, DESCRIPTION) 
VALUES ('ROLEX DAYTONA', 230000, 'Descrição do relógio de pulso');
```

### 4. Inicie o Redis

```bash
# Linux/Mac
redis-server

# Windows (se instalado via WSL ou binário Windows)
redis-server.exe
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DATABASE=mini_projeto_ebd2

# Configurações do Redis (opcional, padrão: localhost:6379)
REDIS_URL=redis://localhost:6379
```

### Exemplo de arquivo `.env`

```env
MYSQL_HOST=localhost
MYSQL_USER=ebd2
MYSQL_PASSWORD=senhaqualquer
MYSQL_DATABASE=mini_projeto_ebd2
```

**⚠️ Importante:** Nunca commite o arquivo `.env` para o repositório. Ele já está incluído no `.gitignore`.

## 🎮 Como Executar

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

O servidor será iniciado em: `http://localhost:3000`

### Modo Produção

```bash
# 1. Compilar o TypeScript
npm run build

# 2. Executar o código compilado
node build/src/server.js
```

### Mensagens de Inicialização

Ao iniciar corretamente, você verá:

```
Redis Client Connected
Redis Client Ready
Definindo cache para ID: 1
Definindo cache para ID: 2
Dados carregados com sucesso para o redis!
Server is running on port 3000
```

## 🌐 Endpoints da API

### Base URL
```
http://localhost:3000
```

### 1. Status do Servidor
**GET** `/`

Verifica se o servidor está funcionando.

**Resposta:**
```
Funcionando...
```

---

### 2. Listar Todos os Produtos
**GET** `/getAllProducts`

Retorna todos os produtos do cache Redis.

**Resposta de Sucesso (200):**
```json
[
    {
        "id": 1,
        "name": "ROLEX SUBMARINER",
        "price": 12000.00,
        "description": "Descrição do relógio de pulso"
    },
    {
        "id": 2,
        "name": "ROLEX DAYTONA",
        "price": 230000.00,
        "description": "Descrição do relógio de pulso"
    }
]
```

---

### 3. Buscar Produto por ID
**GET** `/getProductID/:id`

Retorna um produto específico do cache Redis.

**Parâmetros:**
- `id` (URL) - ID do produto

**Exemplo:**
```
GET /getProductID/1
```

**Resposta de Sucesso (200):**
```json
{
    "id": 1,
    "name": "ROLEX SUBMARINER",
    "price": 12000.00,
    "description": "Descrição do relógio de pulso"
}
```

---

### 4. Adicionar Novo Produto
**POST** `/addProduct`

Cria um novo produto no MySQL e automaticamente adiciona ao cache Redis.

**Body (JSON):**
```json
{
    "name": "ROLEX GMT-MASTER II",
    "price": 45000.00,
    "description": "Relógio com dois fusos horários"
}
```

**Resposta de Sucesso (200):**
```json
{
    "id": 3,
    "name": "ROLEX GMT-MASTER II",
    "price": 45000.00,
    "description": "Relógio com dois fusos horários"
}
```

---

### 5. Atualizar Produto
**PUT** `/updateProduct`

Atualiza um produto existente no MySQL e sincroniza com o cache Redis.

**Body (JSON):**
```json
{
    "id": 1,
    "name": "ROLEX SUBMARINER DATE",
    "price": 15000.00,
    "description": "Relógio de mergulho profissional com data"
}
```

**Resposta de Sucesso (200):**
```json
{
    "id": 1,
    "name": "ROLEX SUBMARINER DATE",
    "price": 15000.00,
    "description": "Relógio de mergulho profissional com data"
}
```

---

### 6. Deletar Produto
**DELETE** `/deleteProduct/:id`

Remove um produto do MySQL e do cache Redis simultaneamente.

**Parâmetros:**
- `id` (URL) - ID do produto a ser deletado

**Exemplo:**
```
DELETE /deleteProduct/3
```

**Resposta de Sucesso (200):**
```
Status: 200 OK
```

---

### 7. Desligar Servidor
**POST** `/shutdown`

Encerra as conexões com MySQL e Redis de forma segura.

**Resposta de Sucesso (200):**
```
Servidor desligando...
```

## 💡 Exemplos de Uso

### Usando cURL

#### Listar todos os produtos
```bash
curl http://localhost:3000/getAllProducts
```

#### Buscar produto específico
```bash
curl http://localhost:3000/getProductID/1
```

#### Adicionar novo produto
```bash
curl -X POST http://localhost:3000/addProduct \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple Watch Series 9",
    "price": 4500.00,
    "description": "Smartwatch com GPS e monitoramento de saúde"
  }'
```

#### Atualizar produto
```bash
curl -X PUT http://localhost:3000/updateProduct \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "ROLEX SUBMARINER UPDATED",
    "price": 13500.00,
    "description": "Nova descrição atualizada"
  }'
```

#### Deletar produto
```bash
curl -X DELETE http://localhost:3000/deleteProduct/1
```

### Usando Postman ou Insomnia

1. **Importe a coleção** ou crie manualmente as requisições
2. **Configure a base URL**: `http://localhost:3000`
3. **Teste cada endpoint** conforme documentado acima

### Usando JavaScript/Fetch

```javascript
// Buscar todos os produtos
fetch('http://localhost:3000/getAllProducts')
  .then(response => response.json())
  .then(data => console.log(data));

// Adicionar produto
fetch('http://localhost:3000/addProduct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Samsung Galaxy Watch',
    price: 2500.00,
    description: 'Smartwatch Android'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## 📁 Estrutura do Projeto

```
ServidorRedis/
├── src/
│   ├── server.ts              # Servidor Express e rotas da API
│   ├── ProductsRepository.ts  # Lógica de negócio e operações com DB/Cache
│   ├── product.ts             # Interface/Modelo do produto
│   ├── db.ts                  # Configuração da conexão MySQL
│   └── redis.ts               # Configuração do cliente Redis
├── build/                     # Código JavaScript compilado (gerado)
├── node_modules/              # Dependências do projeto
├── .env                       # Variáveis de ambiente (não versionado)
├── .gitignore                 # Arquivos ignorados pelo Git
├── DUMP.sql                   # Script de criação do banco de dados
├── package.json               # Dependências e scripts do projeto
├── tsconfig.json              # Configurações do TypeScript
└── README.md                  # Documentação do projeto
```

### Descrição dos Arquivos Principais

#### `src/server.ts`
Arquivo principal que:
- Inicializa o servidor Express
- Define todas as rotas da API
- Carrega o cache Redis na inicialização
- Configura middlewares

#### `src/ProductsRepository.ts`
Classe responsável por:
- Operações CRUD no MySQL
- Gerenciamento do cache Redis
- Sincronização entre banco e cache
- Carregamento inicial dos dados

#### `src/product.ts`
Define a interface TypeScript do modelo Product:
```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
}
```

#### `src/db.ts`
Configura e exporta a conexão com o MySQL usando variáveis de ambiente.

#### `src/redis.ts`
Configura e exporta o cliente Redis com tratamento de eventos:
- Conexão
- Erros
- Desconexão

## 🔄 Estratégias de Sincronização

### Sincronização Automática

O sistema mantém sincronização automática entre MySQL e Redis através de:

1. **Carregamento Inicial**: Método `loadCache()` executado na inicialização
2. **Criação**: Produto salvo no MySQL → Imediatamente armazenado no Redis
3. **Atualização**: Produto atualizado no MySQL → Cache atualizado no Redis
4. **Exclusão**: Produto removido do MySQL → Cache limpo no Redis

### Ressincronização Manual

Se houver edição manual no MySQL, você pode ressincronizar o Redis:

#### Opção 1: Reiniciar o Servidor
```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```
O método `loadCache()` será executado automaticamente e recarregará todos os produtos.

#### Opção 2: Limpar Cache Redis e Reiniciar
```bash
# Conectar ao Redis CLI
redis-cli

# Limpar todos os produtos do cache
KEYS product:*
# Para cada chave retornada:
DEL product:1
DEL product:2
# Ou limpar tudo de uma vez:
FLUSHALL

# Sair do Redis CLI
exit

# Reiniciar o servidor Node.js
npm run dev
```

#### Opção 3: Implementar Endpoint de Ressincronização (Futuro)
Você pode adicionar um endpoint administrativo:
```typescript
routes.post('/admin/resync', async (req: Request, res: Response) => {
    await productsRepo.loadCache();
    res.send('Cache ressincronizado com sucesso!');
});
```

### Problemas Conhecidos e Limitações

1. **Edição Manual no MySQL**: Não atualiza automaticamente o Redis
   - **Solução**: Reiniciar o servidor ou implementar endpoint de ressincronização

2. **Perda de Dados no Redis**: Se o Redis for reiniciado, o cache é perdido
   - **Solução**: O sistema recarrega automaticamente ao iniciar o servidor Node.js

3. **Concorrência**: Múltiplas escritas simultâneas podem causar inconsistências
   - **Solução Futura**: Implementar transações ou locks distribuídos

4. **Escalabilidade Horizontal**: Cache não é compartilhado entre múltiplas instâncias
   - **Solução Futura**: Usar Redis Cluster ou Redis Sentinel

## 🔧 Troubleshooting

### Problema: Erro ao conectar ao MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Soluções:**
- Verifique se o MySQL está rodando: `sudo service mysql status`
- Verifique as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u root -p`

---

### Problema: Erro ao conectar ao Redis
```
Redis Client Error Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Soluções:**
- Verifique se o Redis está rodando: `redis-cli ping` (deve retornar `PONG`)
- Inicie o Redis: `redis-server`
- Verifique a porta: `redis-cli -p 6379`

---

### Problema: Banco de dados não existe
```
Error: ER_BAD_DB_ERROR: Unknown database 'mini_projeto_ebd2'
```
**Solução:**
- Execute o script DUMP.sql: `mysql -u root -p < DUMP.sql`

---

### Problema: Módulos não encontrados
```
Error: Cannot find module 'express'
```
**Solução:**
- Reinstale as dependências: `npm install`

---

### Problema: Porta 3000 já em uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solução:**
- Encerre o processo na porta 3000: `lsof -ti:3000 | xargs kill -9` (Linux/Mac)
- Ou altere a porta no arquivo `server.ts`

---

### Problema: Cache desatualizado
**Sintomas:** Dados no Redis diferentes do MySQL

**Solução:**
```bash
# Limpar cache Redis
redis-cli FLUSHALL

# Reiniciar servidor para recarregar
npm run dev
```

## 🎯 Cenário de Uso Real

### Loja Virtual com Alto Tráfego

Imagine uma loja virtual que recebe **10.000 requisições por segundo** buscando produtos:

#### Sem Cache (Apenas MySQL)
- Cada consulta acessa o disco (lento)
- Banco de dados sobrecarregado
- Tempo de resposta: **100-500ms** por consulta
- Conexões simultâneas limitadas (~1000)

#### Com Cache Redis (Implementação Atual)
- Consultas buscam da memória RAM (rápido)
- Banco de dados aliviado
- Tempo de resposta: **< 5ms** por consulta
- Suporta milhares de conexões simultâneas
- **Melhoria de 20x a 100x na performance!**

### Teste de Performance

Você pode testar a diferença usando ferramentas como Apache Bench:

```bash
# Instalar Apache Bench
sudo apt-get install apache2-utils  # Linux
brew install httpie                  # Mac

# Teste de carga
ab -n 1000 -c 100 http://localhost:3000/getAllProducts
```

Isso enviará 1000 requisições com 100 conexões concorrentes.

## 📚 Referências e Recursos Adicionais

### Documentação Oficial
- [Redis Documentation](https://redis.io/documentation)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Padrões de Cache
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

### Ferramentas Úteis
- [Postman](https://www.postman.com/) - Testar APIs
- [Redis Commander](https://github.com/joeferner/redis-commander) - GUI para Redis
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - GUI para MySQL

## 👥 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte do curso de Estrutura de Banco de Dados 2.

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte a documentação das tecnologias utilizadas
3. Abra uma issue no repositório do GitHub

---

**Desenvolvido para o trabalho de Estrutura de Banco de Dados 2 (EBD2)**

**Data de Entrega:** 01/11 das 08:00 às 23:59h via Canvas
