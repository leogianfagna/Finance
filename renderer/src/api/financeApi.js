export const financeApi = {
  monthsList: async () => window.finance.monthsList(),
  monthsGet: async ({ year, month }) => window.finance.monthsGet({ year, month }),
  monthsUpsert: async ({ year, month, data }) => window.finance.monthsUpsert({ year, month, data }),
  monthsCopyFromPrevious: async ({ year, month }) =>
    window.finance.monthsCopyFromPrevious({ year, month }),
  monthsDelete: async ({ year, month }) => window.finance.monthsDelete({ year, month }),
};
