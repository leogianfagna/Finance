# Rodar dev
npm run dev na raíz

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


## Dados ausentes para analytics financeiros avancados

Hoje a aplicacao ja permite bons graficos com os dados atuais (patrimonio mensal, composicao por tipo/instituicao, fluxo de entradas e saidas e despesas por categoria).
Para ampliar as analises para um padrao mais completo de mercado, estes dados ainda faltam:

1. Historico diario/semanal de valor de mercado dos ativos (para volatilidade, drawdown e risco).
2. Preco de aquisicao por ativo e quantidade por lote (para retorno realizado x nao realizado e custo medio).
3. Meta de alocacao por classe de ativo (para grafico de desvio entre alocacao atual x alvo).
4. Orcamento planejado por categoria por mes (para analise real x orcado).
5. Indicador de recorrencia de lancamentos e data de vencimento (para previsao de fluxo de caixa futuro).
6. Dados de inflacao e benchmark (CDI, IPCA, etc.) para retorno real e comparativos de performance.
7. Classificacao de risco e liquidez de cada ativo (para mapa de risco e concentracao).
