/**
 * Admin Dashboard Render Function
 * @param {Array} rawData - Main index.html se aane wala complete dataset
 * @param {string} selectedState - Selected state filter ('ALL' ya specific state)
 */
function renderAdminPerformance(rawData, selectedState = 'ALL') {
  const tbody = document.getElementById('admin-emp-table-body');
  const cardState = document.getElementById('admin-card-state');
  const cardRate = document.getElementById('admin-card-rate');
  const cardTotal = document.getElementById('admin-card-total');

  if (!tbody || !rawData) return;

  // 1. Filter Data by State
  const filteredData = selectedState === 'ALL' 
    ? rawData 
    : rawData.filter(item => (item.state || item.State) === selectedState);

  // 2. Group Data by State + Employee
  const empMap = {};
  let overallTotal = 0;
  let overallCompleted = 0;

  filteredData.forEach(row => {
    // Normalizing keys (Case-insensitive check)
    const stateName = row.state || row.State || 'Unknown State';
    const empName = row.employeeName || row.empName || row.Employee || 'Unknown';
    const status = (row.status || row.Status || '').toLowerCase();
    const remark = row.remark || row.Remarks || row.remark_text || 'No remark';

    overallTotal++;
    const isCompleted = status === 'completed' || status === 'done' || status === 'approved';
    if (isCompleted) overallCompleted++;

    const key = `${stateName}__${empName}`;
    if (!empMap[key]) {
      empMap[key] = {
        state: stateName,
        name: empName,
        total: 0,
        completed: 0,
        pending: 0,
        latestRemark: ''
      };
    }

    empMap[key].total++;
    if (isCompleted) {
      empMap[key].completed++;
    } else {
      empMap[key].pending++;
    }
    empMap[key].latestRemark = remark; // Updates to last logged remark
  });

  // 3. Update Summary Stat Cards (agar UI me hain)
  if (cardState) cardState.innerText = selectedState;
  if (cardTotal) cardTotal.innerText = overallTotal;
  if (cardRate) {
    const ratePercentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;
    cardRate.innerText = `${ratePercentage}%`;
  }

  // 4. Render Admin Table Rows
  tbody.innerHTML = '';
  const empKeys = Object.keys(empMap);

  if (empKeys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No performance records found for ${selectedState}</td></tr>`;
    return;
  }

  empKeys.forEach(key => {
    const emp = empMap[key];
    const completionPercent = Math.round((emp.completed / emp.total) * 100);

    // Performance Badge Logic based on Remark & Completion
    let badgeHTML = '';
    if (completionPercent >= 80) {
      badgeHTML = `<span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: bold;">High</span>`;
    } else if (completionPercent >= 50) {
      badgeHTML = `<span style="background: #fffde7; color: #f57f17; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Average</span>`;
    } else {
      badgeHTML = `<span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Attention Needed</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${emp.state}</b></td>
      <td>${emp.name}</td>
      <td>${emp.total}</td>
      <td><span style="color: #2e7d32; font-weight: 600;">${emp.completed}</span></td>
      <td><span style="color: #c62828; font-weight: 600;">${emp.pending}</span></td>
      <td><i style="color: #555;">"${emp.latestRemark}"</i></td>
      <td>${badgeHTML}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Dropdown state change handler
 */
function onAdminStateFilterChange(event) {
  const selectedState = event.target.value;
  // Assumes main raw dataset is available globally as window.allRTOData
  if (window.allRTOData) {
    renderAdminPerformance(window.allRTOData, selectedState);
  }
}
