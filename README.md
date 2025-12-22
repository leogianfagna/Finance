# Electron + React Todo (SQLite)

Pequena aplicação de exemplo usando **Electron + React (Vite)** com **SQLite** local.
Os dados da to-do list são salvos em um arquivo de banco de dados no seu computador
(usando `better-sqlite3`), dentro da pasta `userData` do Electron.

Estrutura principal:

- `electron/`
  - `main.js`: processo principal do Electron, IPC e criação da janela
  - `preload.js`: expõe a API segura (`window.api`) para o React
  - `db.js`: inicializa o SQLite e cria a tabela de TODOs
  - `electron-builder.yml`: configuração do `electron-builder`
- `renderer/`
  - `index.html`: HTML raiz do app React
  - `src/main.jsx`: entrada do React
  - `src/App.jsx`: tela simples de to-do list
  - `src/style.css`: estilos

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm

## Instalação

Clone este repositório e instale as dependências:

```bash
npm install
cd renderer
npm install
cd ..
```

## Rodando em modo desenvolvimento

Na raiz do projeto:

```bash
npm run dev
```

Isso vai:

- subir o Vite na porta padrão (5173)
- abrir o Electron apontando para `http://localhost:5173`

Qualquer alteração na UI recarrega automaticamente.

## Build de produção (desktop)

Na raiz do projeto:

```bash
npm run build
```

Esse comando:

1. gera o build do React (`renderer/dist`);
2. chama o `electron-builder` usando `electron/electron-builder.yml`;
3. escreve os artefatos de instalação em `dist/` (por exemplo `.AppImage`, `.exe`, etc.,
   dependendo do sistema operacional em que você rodar).

## Como funciona a persistência

- O arquivo do banco de dados é criado em:
  - `app.getPath("userData")`, com o nome `todos.db`.
- A tabela `todos` é criada automaticamente na primeira execução.
- As ações disponíveis:
  - listar todos (`window.api.listTodos()`)
  - adicionar (`window.api.addTodo(text)`)
  - alternar concluído/não concluído (`window.api.toggleTodo(id)`)
  - deletar (`window.api.deleteTodo(id)`)

Toda a comunicação entre o React e o Electron é feita via IPC, passando pelo `preload.js`
com `contextBridge.exposeInMainWorld`.

## GitHub Actions (build automático ao criar release)

Já existe um workflow em:

- `.github/workflows/build-electron.yml`

Ele é disparado quando você publica uma **release** no GitHub (`on: release: types: [published]`).
O workflow faz:

1. checkout do código;
2. instala dependências (`npm install` e `cd renderer && npm install`);
3. roda `npm run build` (gera artefatos em `dist/`);
4. anexa tudo de `dist/**` na release.

> Importante: para funcionar, o repositório precisa ter o `GITHUB_TOKEN` padrão
> habilitado (já vem por padrão na maioria dos casos).

## Produção

- Para gerar instaladores localmente, use `npm run build` (na raiz).
- Para distribuir com CI, crie uma tag e uma release no GitHub; o workflow vai
  gerar os builds e anexar na release automaticamente.

---

Sinta-se à vontade para adaptar a estrutura para TS, adicionar mais tabelas, telas,
rotas, etc. A base já está pronta para ser usada como template.
