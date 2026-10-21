# PecuCore Front

Projeto para a disciplina de Projeto Detalhado de Software, desenvolvido em Vue 3 + TypeScript para consumir a API Java (Spring Boot).

## Tecnologias

- Vue 3 + TypeScript
- Vite
- Vue Router e Pinia
- Tailwind CSS

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (exigência do Vite)
- npm
- API `pecu-core` rodando em `http://127.0.0.1:8080`

## Configuração

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env.development
```

| Variável            | Descrição                    | Valor padrão |
| ------------------- | ---------------------------- | ------------ |
| `VITE_API_BASE_URL` | URL base usada nas chamadas à API | `/api`       |

Em desenvolvimento, o Vite redireciona as chamadas de `/api` para `http://127.0.0.1:8080`, removendo o prefixo `/api`. Se a API rodar em outra porta, ajuste o `proxy` em `vite.config.ts`.

## Execução

Instale as dependências:

```bash
npm install
```

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação fica disponível em `http://127.0.0.1:5173`.

## Build de produção

```bash
npm run build
npm run preview
```

O `build` faz a checagem de tipos (`vue-tsc`) e gera os arquivos em `dist/`. O `preview` serve esse build localmente.

Em produção não existe o proxy do Vite. Defina `VITE_API_BASE_URL` com a URL completa da API (por exemplo `https://api.exemplo.com`) antes do build, e libere a origem do front na variável `CORS_ALLOWED_ORIGINS` da API.

## Perfis de acesso

O login é feito com os usuários cadastrados na API. As telas mudam conforme o perfil:

- **ADMIN**: usuários, propriedades, lotes, animais e metas de desempenho
- **PRODUTOR**: propriedades, lotes, animais, manejo (pesagens, alimentação, vacinação, medicamentos), custos e desempenho
- **VETERINARIO**: animais e manejo das propriedades às quais está vinculado; propriedades e lotes só para consulta
