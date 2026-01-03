import { useForm } from "react-hook-form";

import { TYPES, INSTITUTIONS } from "/src/constants/constants"; 
// Se você ainda não tiver INSTITUTIONS, pode criar assim:
// export const INSTITUTIONS = ["Nubank", "Itaú", "Bradesco", "Santander", "Caixa", "Inter"];

export default function AssetEditor({ onAdd }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      type: "cash",
      institution: "",
      total: "",
    },
    mode: "onSubmit", // ou "onChange" se quiser validar enquanto digita
  });

  function toNumberBR(value) {
    // aceita "1234.56" e também "1.234,56"
    if (typeof value !== "string") return NaN;
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  const onSubmit = (data) => {
    const totalNumber = toNumberBR(data.total);

    onAdd({
      id: crypto.randomUUID?.() || String(Date.now()),
      name: data.name.trim(),
      type: data.type,
      institution: data.institution,
      total: Number.isFinite(totalNumber) ? totalNumber : 0,
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    reset(); // volta para defaultValues
  };

  return (
    <div style={{ border: "1px solid #3333", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <span style={{ margin: "0 0 10px", color: "gray", "fontSize": "0.8rem" }}>Adicionar ativo</span>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Nome
            <input
              placeholder="Ex: Nubank"
              {...register("name", {
                required: "Informe o nome",
                validate: (v) => v.trim().length > 0 || "Informe o nome",
              })}
            />
            {errors.name && (
              <span style={{ fontSize: 12, color: "crimson" }}>{errors.name.message}</span>
            )}
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Tipo
            <select {...register("type", { required: "Selecione o tipo" })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && (
              <span style={{ fontSize: 12, color: "crimson" }}>{errors.type.message}</span>
            )}
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Instituição
            <select
              {...register("institution", {
                required: "Selecione a instituição",
              })}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {INSTITUTIONS.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            {errors.institution && (
              <span style={{ fontSize: 12, color: "crimson" }}>
                {errors.institution.message}
              </span>
            )}
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Total (R$)
            <input
              inputMode="decimal"
              placeholder="Ex: 1500,00"
              {...register("total", {
                required: "Informe o total",
                validate: (v) => {
                  const n = toNumberBR(v);
                  if (!Number.isFinite(n)) return "Digite um número válido";
                  if (n <= 0) return "O total deve ser maior que zero";
                  return true;
                },
              })}
            />
            {errors.total && (
              <span style={{ fontSize: 12, color: "crimson" }}>{errors.total.message}</span>
            )}
          </label>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <button type="submit" disabled={isSubmitting}>
              Adicionar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
