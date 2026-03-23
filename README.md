# Gestao de Custos de Obras

Aplicacao web para gerenciamento de custos em obras, preparada para rodar com PostgreSQL no Render.

## O que mudou

- Os dados de `usuarios`, `obras` e `compras` agora saem do navegador e passam a ser persistidos no banco.
- O frontend em [app.js](C:\Users\joaof\Documents\New project\app.js) consome a API do servidor.
- O backend em [server.js](C:\Users\joaof\Documents\New project\server.js) conecta no Postgres via `DATABASE_URL`.
- O schema do banco e o usuario administrador inicial sao criados automaticamente na inicializacao.
- A autenticacao agora usa sessao no servidor com cookie `HttpOnly`.

## Perfis de acesso

- `administrador`: pode cadastrar usuarios, cadastrar/editar/excluir obras, finalizar obras, lancar/excluir compras e emitir relatorios.
- `usuario`: pode lancar/excluir compras e emitir relatorios.

## Variaveis de ambiente

Obrigatorias:

- `DATABASE_URL`

Opcionais:

- `PORT`
- `NODE_ENV=production`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Se `ADMIN_EMAIL` e `ADMIN_PASSWORD` nao forem definidos, o sistema cria o gerente inicial com:

- E-mail: `admin@obra.local`
- Senha: `123456`

## Como rodar localmente

1. Instale o Node.js 18 ou superior.
2. Tenha um PostgreSQL disponivel localmente ou remoto.
3. Defina a variavel `DATABASE_URL`.
4. Execute:

```bash
npm install
npm start
```

5. Abra `http://localhost:3000`.

Exemplo de `DATABASE_URL` local:

```bash
postgresql://postgres:senha@localhost:5432/gestao_obras
```

## Deploy no Render

### Banco de dados

1. No Render, crie um `PostgreSQL`.
2. Copie a `Internal Database URL` do banco criado.

### Web Service

1. Envie este projeto para um repositorio no GitHub.
2. No Render, crie um novo `Web Service`.
3. Conecte o repositorio.
4. Configure:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/healthz`

5. Em `Environment`, adicione:

- `DATABASE_URL` = internal database URL do Postgres
- `NODE_ENV` = `production`
- `ADMIN_EMAIL` = e-mail inicial do gerente (opcional)
- `ADMIN_PASSWORD` = senha inicial do gerente (opcional)

6. Conclua o deploy.

### Blueprint opcional

O arquivo [render.yaml](C:\Users\joaof\Documents\New project\render.yaml) configura o Web Service. O banco continua sendo criado no painel do Render e a `DATABASE_URL` deve ser vinculada nas variaveis do servico.

## Deploy automatizado

O repositório agora inclui o workflow [render-deploy.yml](C:\Users\joaof\Documents\New project\.github\workflows\render-deploy.yml), que pode:

- disparar deploy automaticamente a cada `push` na branch `main`
- permitir deploy manual em `Actions > Render Deploy > Run workflow`

Para ativar:

1. No Render, abra o seu Web Service.
2. Vá em `Settings > Deploy Hook`.
3. Crie ou copie a URL do deploy hook.
4. No GitHub do repositório, abra `Settings > Secrets and variables > Actions`.
5. Crie o secret:

- `RENDER_DEPLOY_HOOK_URL`

Depois disso, cada push em `main` pode acionar o deploy automaticamente pelo GitHub Actions.

## Dependencias e erros comuns

Ja ajustados:

- `package.json` possui script `start`
- O servidor escuta `process.env.PORT`
- O servidor escuta em `0.0.0.0`
- Existe health check em `/healthz`
- O pacote `pg` foi incluido para conexao com PostgreSQL
- O app nao depende mais de `localStorage` para persistencia de negocio

Erros comuns a evitar:

- esquecer de configurar `DATABASE_URL`
- usar a URL externa do banco quando a interna do Render e mais apropriada para servicos no mesmo ambiente
- trocar a senha do admin sem atualizar `ADMIN_PASSWORD` em um primeiro deploy, esperando que o seed substitua um usuario ja criado

## App Android de RDO

- A versao mobile focada em `RDO` fica em:
  - `/rdo-mobile.html`
- O app usa o mesmo backend e as mesmas credenciais do sistema principal.
- Depois do deploy, abra essa rota no Android e use:
  - o botao `Instalar` do proprio app, quando disponivel
  - ou `Adicionar a tela inicial` no navegador
- Para fotos do RDO, o app oferece:
  - `Tirar foto` com a camera do celular
  - `Galeria` para selecionar fotos ja salvas

## Empacotamento Android

O projeto agora tambem inclui uma casca Android com `Capacitor`, apontando para a rota mobile do sistema:

- URL usada no app Android:
  - `https://compras-por-obra.onrender.com/rdo-mobile.html`
- Arquivos principais do empacotamento:
  - [capacitor.config.json](C:\Users\joaof\Documents\New project\capacitor.config.json)
  - diretório [android](C:\Users\joaof\Documents\New project\android)

Scripts disponiveis:

- `npm run android:sync`
- `npm run android:open`
- `npm run android:run`
- `npm run android:build:debug`

Observacao importante:

- para gerar o APK localmente, a maquina precisa ter `Java/JDK` e ambiente Android configurados
- neste workspace, o projeto Android foi gerado, mas a compilacao do APK nao concluiu porque o `JAVA_HOME` nao esta configurado

## Estrutura principal

- [index.html](C:\Users\joaof\Documents\New project\index.html)
- [style.css](C:\Users\joaof\Documents\New project\style.css)
- [app.js](C:\Users\joaof\Documents\New project\app.js)
- [rdo-mobile.html](C:\Users\joaof\Documents\New project\rdo-mobile.html)
- [rdo-mobile.css](C:\Users\joaof\Documents\New project\rdo-mobile.css)
- [rdo-mobile.js](C:\Users\joaof\Documents\New project\rdo-mobile.js)
- [server.js](C:\Users\joaof\Documents\New project\server.js)
- [package.json](C:\Users\joaof\Documents\New project\package.json)
- [render.yaml](C:\Users\joaof\Documents\New project\render.yaml)
