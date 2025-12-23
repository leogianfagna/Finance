# Instalação e build

Clone este repositório e instale as dependências:

```bash
npm install
cd renderer
npm install
cd ..

npm run build
```

Esse comando:

1. gera o build do React (`renderer/dist`);
2. chama o `electron-builder` usando `electron/electron-builder.yml`;
3. escreve os artefatos de instalação em `dist/`. Terá um .exe pronto para rodar o aplicativo