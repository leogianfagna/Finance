import { useEffect, useMemo, useState } from "react";
import { financeApi } from "../api/financeApi.js";

import MonthPicker from "../components/MonthPicker.jsx";
import AssetEditor from "../components/AssetEditor.jsx";
import AssetsTable from "../components/AssetsTable.jsx";
import StatementImporter from "../components/StatmentImporter.jsx";
import StatementTable from "../components/StatementTable.jsx";

import {
  computeTotals,
  defaultMonthData,
  getNowYearMonth,
  monthKey,
} from "../utils/month.js";

/**
 * Ponto inicial da aplicação.
 */
export default function Dashboard() {
  const now = getNowYearMonth();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const selectedMonth = useMemo(() => monthKey(year, month), [year, month]);

  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  /**
   * Baseado no ano, resgata os dados do banco de dados e atribui à estados.
   */
  async function loadCurrentMonthData() {
    setLoading(true);
    try {
      const row = await financeApi.monthsGet({ year, month });
      setMonthData(row);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Carregar os dados da página, baseado no ano e mês selecionado.
   */
  useEffect(() => {
    loadCurrentMonthData();
  }, [year, month]);

  const data = useMemo(() => {
    if (!monthData?.data) return null;
    return monthData.data;
  }, [monthData]);

  const assets = useMemo(() => (data?.assets ? data.assets : []), [data]);
  const statement = useMemo(() => (data?.statement ? data.statement : []), [data]);

  const netWorth = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + (Number(a.total) || 0), 0);
    return total;
  }, [assets]);

  /**
   * Salva todos os dados do mês que está sendo editado. Edita o valor total
   * do balanço antes de inserir.
   *
   * @param {Object} nextData Dados recebidos para inserir no banco.
   */
  async function saveData(nextData) {
    setSavingLoading(true);
    try {
      const fixedWithTotalBalance = computeTotals(nextData);
      console.warn(fixedWithTotalBalance)
      await financeApi.monthsUpsert({ year, month, data: fixedWithTotalBalance });
      await loadCurrentMonthData();
    } finally {
      setSavingLoading(false);
    }
  }

  /**
   * Lida quando um novo mês é criado para receber dados. Salva os dados do mês
   * com um objeto vazio.
   */
  async function handleCreateEmpty() {
    const empty = defaultMonthData(year, month);
    await saveData(empty);
  }

  /**
   * Copia do mês anterior os mesmos dados. Útil quando o usuário cria um novo
   * mês e quer partir de uma base já pré preenchida.
   */
  async function handleCopyFromPrevious() {
    setSavingLoading(true);
    try {
      await financeApi.monthsCopyFromPrevious({ year, month });
      await loadCurrentMonthData();
    } finally {
      setSavingLoading(false);
    }
  }

  /**
   * Apaga o mês atual. Quando isso é feito, é limpo os dados mas a página continua
   * para o usuário.
   */
  async function handleDelete() {
    if (!confirm(`Excluir o mês ${selectedMonth}?`)) return;
    setSavingLoading(true);

    try {
      await financeApi.monthsDelete({ year, month });
      setMonthData(null);
    } finally {
      setSavingLoading(false);
    }
  }

  /**
   * Lida com a inserção de novo "ativo" para a lista do usuário. Ou seja, uma nova
   * linha apenas que contém os dados daquele saldo, com as colunas "id", "name",
   * "institution" e afins.
   *
   * @param {Object} asset Objeto que representa o ativo sendo adicionado para a lista.
   */
  function handleAddAsset(asset) {
    const base = data ?? defaultMonthData(year, month);
    const next = {
      ...base,
      assets: [...(base.assets || []), asset],
    };
    saveData(next);
  }

  /**
   * Alterar dados de uma linha específica de um asset. Essa função é usada dentro do
   * AssetTable que imprime a tabela de dados, e o usuário pode editar diretamente na
   * linha.
   *
   * @param {*} assetId Id (PK do banco de dados) do asset a ser modificado.
   * @param {Object} patch Objeto com as chaves que sofreram alterações (espera-se apenas uma).
   */
  function handleUpdateAsset(assetId, patch) {
    const base = data ?? defaultMonthData(year, month);
    const nextAssets = (base.assets || []).map((a) =>
      a.id === assetId
        ? { ...a, ...patch, lastUpdate: new Date().toISOString().slice(0, 10) }
        : a
    );
    saveData({ ...base, assets: nextAssets });
  }

  /**
   * Apaga uma linha de asset da lista de todas.
   *
   * @param {*} assetId Id (PK do banco de dados) do asset a ser removido.
   */
  function handleRemoveAsset(assetId) {
    const base = data ?? defaultMonthData(year, month);
    const nextAssets = (base.assets || []).filter((a) => a.id !== assetId);
    saveData({ ...base, assets: nextAssets });
  }

  /**
   * Insere uma nova linha de extrato para a lista de todas, que ocorre ao clicar em
   * "Adicionar" em StatementTable. Isso não tem relação na tabela de importar um
   * arquivo externo.
   *
   * @param {Object} newStatement Dados que se encaixam no banco desse novo extrato.
   */
  function handleAddStatementRow(newStatement) {
    const base = data ?? defaultMonthData(year, month);
    const next = {
      ...base,
      statement: [...(base.statement || []), newStatement],
    };
    saveData(next);
  }

  /**
   * Alterar dados de uma linha específica de um extrato. Essa função é usada dentro
   * do StatementTable que imprime a tabela de dados, e o usuário pode editar diretamente
   * na linha.
   *
   * @param {*} statementId Id (PK do banco de dados) do extrato a ser modificado.
   * @param {Object} patch Objeto com as chaves que sofreram alterações (espera-se apenas uma).
   */
  function handleUpdateStatementRow(statementId, patch) {
    const base = data ?? defaultMonthData(year, month);
    const nextStatement = (base.statement || []).map((r) =>
      r.id === statementId
        ? { ...r, ...patch, lastUpdate: new Date().toISOString().slice(0, 10) }
        : r
    );
    saveData({ ...base, statement: nextStatement });
  }

  /**
   * Apaga uma linha de extrato da lista de todas.
   *
   * @param {*} statementId Id (PK do banco de dados) do extrato.
   */
  function handleRemoveStatementRow(statementId) {
    const base = data ?? defaultMonthData(year, month);
    const nextStatement = (base.statement || []).filter((r) => r.id !== statementId);
    saveData({ ...base, statement: nextStatement });
  }

  /**
   * Salva todas as linhas importadas para o extrato de um arquivo no banco de dados
   * com os demais extratos já inseridos. Função chamada no onSubmit do RHF apenas
   * quando todas as linhas estão validadas.
   * 
   * @param {Object[]} fixedImportedStatement Linhas de extrato importadas e validadas.
   */
  function handleSaveStatementRows(fixedImportedStatement) {
    const base = data ?? defaultMonthData(year, month);
    const current = base.statement || [];
    const nextData = current.concat(fixedImportedStatement)
    saveData({ ...base, statement: nextData });
  }

  /**
   * Atualiza o estado do dashboard toda vez que o MonthPicker for atualizado.
   * @param {Object} param Ano e mês selecionado no componente externo.
   */
  function onChangeMonth({ year: y, month: m }) {
    setYear(y);
    setMonth(m);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <MonthPicker
        year={year}
        month={month}
        onChange={onChangeMonth}
        onCreateEmpty={handleCreateEmpty}
        onCopyFromPrevious={handleCopyFromPrevious}
        onDelete={handleDelete}
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ padding: 12, border: "1px solid #3333", borderRadius: 8 }}>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Mês</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedMonth}</div>
        </div>

        <div style={{ padding: 12, border: "1px solid #3333", borderRadius: 8 }}>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Patrimônio total</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {netWorth.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>

        <div style={{ opacity: 0.85 }}>
          {loading
            ? "Carregando..."
            : setMonthData
            ? `Atualizado em: ${setMonthData.updated_at}`
            : "Mês não existe ainda."}
          {savingLoading ? " (salvando...)" : ""}
        </div>
      </div>

      {!setMonthData && (
        <div style={{ padding: 12, border: "1px dashed #3336", borderRadius: 8 }}>
          <p style={{ margin: 0 }}>
            Esse mês ainda não foi criado. Você pode <b>criar vazio</b> ou{" "}
            <b>copiar do mês anterior</b>.
          </p>
        </div>
      )}

      <div style={{ marginTop: 6 }}>
        <h3 style={{ margin: "10px 0" }}>Ativos do mês</h3>
        <AssetEditor onAdd={handleAddAsset} />
        <AssetsTable
          assets={assets}
          onUpdateAsset={handleUpdateAsset}
          onRemoveAsset={handleRemoveAsset}
        />
      </div>

      <div style={{ marginTop: 6 }}>
        <h3 style={{ margin: "10px 0" }}>Histórico do extrato mensal</h3>
        <StatementImporter onImport={handleSaveStatementRows} />

        <StatementTable
          rows={statement}
          onAddRow={handleAddStatementRow}
          onUpdateRow={handleUpdateStatementRow}
          onRemoveRow={handleRemoveStatementRow}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <h3 style={{ margin: "10px 0" }}>Notas do mês</h3>
        <textarea
          rows={4}
          style={{ width: "100%", padding: 10 }}
          value={data?.meta?.notes || ""}
          onChange={(e) => {
            const base = data ?? defaultMonthData(year, month);
            const next = {
              ...base,
              meta: { ...(base.meta || {}), notes: e.target.value },
            };
            saveData(next);
          }}
          placeholder="Ex: mudanças na carteira, observações..."
        />
      </div>
    </div>
  );
}
