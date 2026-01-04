export function generateMonthSummary(data) {
  if (!data) return {};
  const assets = data.data?.assets || [];

  let netWorth = 0;
  let totalByInstitution = {};
  let totalByType = {};

  // build objects
  assets.forEach((asset) => {
    totalByInstitution[asset.institution] = 0;
    totalByType[asset.type] = 0;
  });

  // get statitics
  assets.forEach((asset) => {
    netWorth += asset.total;
    totalByInstitution[asset.institution] =
      totalByInstitution[asset.institution] + asset.total;
    totalByType[asset.type] = totalByType[asset.type] + asset.total;
  });

  return { netWorth, totalByInstitution, totalByType };
}
