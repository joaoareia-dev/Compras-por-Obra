# Gestao de Custos de Obras

Aplicacao web para gerenciamento de custos em obras, pronta para deploy em producao no Render.

## O que foi configurado

- `package.json` com script `start`
- Servidor Node em [server.js](C:\Users\joaof\Documents\New project\server.js)
- Porta configurada com `process.env.PORT`
- `NODE_ENV=production` por padrao
- Health check em `/healthz`
- Blueprint opcional do Render em [render.yaml](C:\Users\joaof\Documents\New project\render.yaml)

## Como rodar localmente

1. Instale o Node.js 18 ou superior.
2. Na pasta do projeto, execute:

```bash
npm install
npm start
```

3. Abra `http://localhost:3000`.

## Deploy no Render

### Opcao 1: pelo painel do Render

1. Envie este projeto para um repositorio no GitHub.
2. No Render, crie um novo `Web Service`.
3. Conecte o repositorio.
4. Configure:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/healthz`

5. Adicione a variavel:

- `NODE_ENV=production`

6. Conclua o deploy.

### Opcao 2: com `render.yaml`

Se o Render detectar o arquivo [render.yaml](C:\Users\joaof\Documents\New project\render.yaml), voce pode criar o servico a partir dele usando Blueprint.

## Observacoes importantes para deploy

- O Render fornece a porta automaticamente via `PORT`, e o servidor ja esta preparado para isso.
- O app atual usa `localStorage`, entao os dados ficam no navegador do usuario e nao em banco de dados.
- Como este projeto serve arquivos estaticos por Node, ele nao depende de `express` nem de outras bibliotecas para subir.

## Erros comuns de deploy evitados aqui

- Falta de script `start` no `package.json`
- Aplicacao ouvindo porta fixa em vez de `process.env.PORT`
- Servidor ouvindo apenas `localhost` em vez de `0.0.0.0`
- Falta de health check para validar se a aplicacao subiu
- Dependencias desnecessarias para um app estatico simples

## Estrutura principal

- [index.html](C:\Users\joaof\Documents\New project\index.html)
- [style.css](C:\Users\joaof\Documents\New project\style.css)
- [app.js](C:\Users\joaof\Documents\New project\app.js)
- [server.js](C:\Users\joaof\Documents\New project\server.js)
- [package.json](C:\Users\joaof\Documents\New project\package.json)
- [render.yaml](C:\Users\joaof\Documents\New project\render.yaml)
