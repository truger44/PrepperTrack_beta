import { InventoryItem, HouseholdMember, HouseholdGroup, PrepperSettings, RationingScenario, SustainabilityMetrics } from '../types';

interface ReportData {
  inventory: InventoryItem[];
  household: HouseholdMember[];
  householdGroups: HouseholdGroup[];
  settings: PrepperSettings;
  rationingScenarios: RationingScenario[];
  selectedRationingScenario: string;
  metrics: SustainabilityMetrics;
  generatedAt: string;
}

export async function generatePDFReport(data: ReportData, reportType: string) {
  // Create a comprehensive HTML document for PDF generation
  const htmlContent = generateHTMLReport(data, reportType);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF reports');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print();
    // Close the window after printing
    setTimeout(() => printWindow.close(), 1000);
  };
}

export function generateCSVReport(data: ReportData, reportType: string) {
  let csvContent = '';
  let filename = '';

  switch (reportType) {
    case 'inventory':
      csvContent = generateInventoryCSV(data.inventory);
      filename = 'inventory-report.csv';
      break;
    case 'household':
      csvContent = generateHouseholdCSV(data.household, data.householdGroups);
      filename = 'household-report.csv';
      break;
    case 'expiration':
      csvContent = generateExpirationCSV(data.inventory);
      filename = 'expiration-report.csv';
      break;
    case 'sustainability':
      csvContent = generateSustainabilityCSV(data.metrics, data.rationingScenarios);
      filename = 'sustainability-report.csv';
      break;
    default:
      csvContent = generateOverviewCSV(data);
      filename = 'overview-report.csv';
  }

  downloadFile(csvContent, filename, 'text/csv');
}

export function generateJSONReport(data: ReportData, reportType: string) {
  let jsonData: any = {};
  let filename = '';

  switch (reportType) {
    case 'inventory':
      jsonData = { inventory: data.inventory, generatedAt: data.generatedAt };
      filename = 'inventory-report.json';
      break;
    case 'household':
      jsonData = { 
        household: data.household, 
        householdGroups: data.householdGroups, 
        generatedAt: data.generatedAt 
      };
      filename = 'household-report.json';
      break;
    case 'sustainability':
      jsonData = { 
        metrics: data.metrics, 
        rationingScenarios: data.rationingScenarios,
        selectedScenario: data.selectedRationingScenario,
        generatedAt: data.generatedAt 
      };
      filename = 'sustainability-report.json';
      break;
    default:
      jsonData = data;
      filename = 'complete-report.json';
  }

  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

function generateHTMLReport(data: ReportData, reportType: string): string {
  const title = `PrepperTrack ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #e2e8f0; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .header h1 { 
          color: #1e293b; 
          margin: 0;
        }
        .header p { 
          color: #64748b; 
          margin: 5px 0;
        }
        .section { 
          margin-bottom: 30px; 
        }
        .section h2 { 
          color: #1e293b; 
          border-bottom: 1px solid #e2e8f0; 
          padding-bottom: 10px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
        }
        th, td { 
          border: 1px solid #e2e8f0; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f8fafc; 
          font-weight: bold;
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin: 20px 0;
        }
        .stat-card { 
          border: 1px solid #e2e8f0; 
          padding: 15px; 
          border-radius: 8px;
          background-color: #f8fafc;
        }
        .stat-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1e293b;
        }
        .stat-label { 
          color: #64748b; 
          font-size: 14px;
        }
        .warning { 
          background-color: #fef2f2; 
          border: 1px solid #fecaca; 
          padding: 10px; 
          border-radius: 4px; 
          margin: 10px 0;
        }
        .expired { color: #dc2626; }
        .expiring { color: #d97706; }
        .good { color: #059669; }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date(data.generatedAt).toLocaleDateString()} at ${new Date(data.generatedAt).toLocaleTimeString()}</p>
        <p>PrepperTrack - Comprehensive Prepper Inventory Management System</p>
      </div>
      
      ${generateReportContent(data, reportType)}
    </body>
    </html>
  `;
}

function generateReportContent(data: ReportData, reportType: string): string {
  switch (reportType) {
    case 'inventory':
      return generateInventoryHTML(data.inventory);
    case 'household':
      return generateHouseholdHTML(data.household, data.householdGroups);
    case 'sustainability':
      return generateSustainabilityHTML(data.metrics, data.rationingScenarios, data.household);
    case 'expiration':
      return generateExpirationHTML(data.inventory);
    default:
      return generateOverviewHTML(data);
  }
}

function generateInventoryHTML(inventory: InventoryItem[]): string {
  const totalValue = inventory.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  
  const categoryBreakdown = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
    <div class="section">
      <h2>Inventory Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${inventory.length}</div>
          <div class="stat-label">Unique Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalItems}</div>
          <div class="stat-label">Total Quantity</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$${totalValue.toFixed(0)}</div>
          <div class="stat-label">Total Value</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Category Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Item Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => `
              <tr>
                <td>${category}</td>
                <td>${count}</td>
                <td>${((count / inventory.length) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Complete Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Expiration</th>
            <th>Location</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td>${item.quantity}</td>
              <td>${item.unit}</td>
              <td>${item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</td>
              <td>${item.storageLocation}</td>
              <td>${item.cost ? '$' + (item.cost * item.quantity).toFixed(2) : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateHouseholdHTML(household: HouseholdMember[], groups: HouseholdGroup[]): string {
  const totalCalories = household.reduce((sum, member) => sum + member.dailyCalories, 0);
  const totalWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);

  return `
    <div class="section">
      <h2>Household Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${household.length}</div>
          <div class="stat-label">Total Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalCalories.toLocaleString()}</div>
          <div class="stat-label">Daily Calories</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalWater.toFixed(1)}L</div>
          <div class="stat-label">Daily Water</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${groups.length}</div>
          <div class="stat-label">Groups</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Household Members</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Activity Level</th>
            <th>Daily Calories</th>
            <th>Daily Water</th>
            <th>Group</th>
            <th>Skills</th>
          </tr>
        </thead>
        <tbody>
          ${household.map(member => {
            const group = groups.find(g => g.id === member.groupId);
            return `
              <tr>
                <td>${member.name}</td>
                <td>${member.age}</td>
                <td>${member.activityLevel}</td>
                <td>${member.dailyCalories}</td>
                <td>${member.dailyWaterLiters}L</td>
                <td>${group ? group.name : 'Ungrouped'}</td>
                <td>${member.skills?.join(', ') || 'None'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Groups</h2>
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Type</th>
            <th>Members</th>
            <th>Leader</th>
            <th>Daily Calories</th>
            <th>Daily Water</th>
          </tr>
        </thead>
        <tbody>
          ${groups.map(group => {
            const groupMembers = household.filter(m => m.groupId === group.id);
            const leader = groupMembers.find(m => m.id === group.leader);
            const groupCalories = groupMembers.reduce((sum, m) => sum + m.dailyCalories, 0);
            const groupWater = groupMembers.reduce((sum, m) => sum + m.dailyWaterLiters, 0);
            
            return `
              <tr>
                <td>${group.name}</td>
                <td>${group.groupType}</td>
                <td>${groupMembers.length}</td>
                <td>${leader ? leader.name : 'None'}</td>
                <td>${groupCalories}</td>
                <td>${groupWater.toFixed(1)}L</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateSustainabilityHTML(metrics: SustainabilityMetrics, scenarios: RationingScenario[], household: HouseholdMember[]): string {
  return `
    <div class="section">
      <h2>Sustainability Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${metrics.normalUsageDays}</div>
          <div class="stat-label">Days of Supply (Normal)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${household.length}</div>
          <div class="stat-label">Household Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${metrics.warningFlags.length}</div>
          <div class="stat-label">Active Warnings</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Rationing Scenarios</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Reduction %</th>
            <th>Duration (Days)</th>
            <th>Calories/Person</th>
            <th>Safety Status</th>
          </tr>
        </thead>
        <tbody>
          ${scenarios.map(scenario => {
            const duration = metrics.rationedUsageDays[scenario.id] || 0;
            const caloriesPerPerson = metrics.dailyCaloriesPerPerson[scenario.id] || 0;
            const isSafe = caloriesPerPerson >= 1200;
            
            return `
              <tr>
                <td>${scenario.name}</td>
                <td>${scenario.reductionPercentage}%</td>
                <td>${duration}</td>
                <td class="${isSafe ? 'good' : 'expired'}">${Math.round(caloriesPerPerson)}</td>
                <td class="${isSafe ? 'good' : 'expired'}">${isSafe ? 'Safe' : 'Critical'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    ${metrics.warningFlags.length > 0 ? `
      <div class="section">
        <h2>Active Warnings</h2>
        ${metrics.warningFlags.map(warning => `
          <div class="warning">
            <strong>${warning.category}:</strong> ${warning.message}
            ${warning.daysRemaining !== undefined ? 
              `<br><small>${warning.daysRemaining > 0 ? 
                `${warning.daysRemaining} days remaining` : 
                `Expired ${Math.abs(warning.daysRemaining)} days ago`}</small>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function generateExpirationHTML(inventory: InventoryItem[]): string {
  const today = new Date();
  
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: 'none', days: null, category: 'No Expiration' };
    
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), category: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', days: daysUntilExpiry, category: 'Expires Soon' };
    } else {
      return { status: 'good', days: daysUntilExpiry, category: 'Good' };
    }
  };

  const categorizedItems = inventory.reduce((acc, item) => {
    const status = getExpirationStatus(item.expirationDate);
    if (!acc[status.category]) {
      acc[status.category] = [];
    }
    acc[status.category].push({ ...item, expirationInfo: status });
    return acc;
  }, {} as Record<string, Array<InventoryItem & { expirationInfo: ReturnType<typeof getExpirationStatus> }>>);

  return `
    <div class="section">
      <h2>Expiration Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value expired">${categorizedItems['Expired']?.length || 0}</div>
          <div class="stat-label">Expired Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value expiring">${categorizedItems['Expires Soon']?.length || 0}</div>
          <div class="stat-label">Expiring Soon</div>
        </div>
        <div class="stat-card">
          <div class="stat-value good">${categorizedItems['Good']?.length || 0}</div>
          <div class="stat-label">Good Condition</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Items by Expiration Status</h2>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Expiration Date</th>
            <th>Days Remaining</th>
            <th>Status</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          ${inventory
            .filter(item => item.expirationDate)
            .sort((a, b) => {
              if (!a.expirationDate || !b.expirationDate) return 0;
              return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            })
            .map(item => {
              const expInfo = getExpirationStatus(item.expirationDate);
              return `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>${item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</td>
                  <td class="${expInfo.status}">${expInfo.days !== null ? 
                    (expInfo.status === 'expired' ? 
                      `Expired ${expInfo.days} days ago` : 
                      `${expInfo.days} days`) : 'N/A'}</td>
                  <td class="${expInfo.status}">${expInfo.category}</td>
                  <td>${item.storageLocation}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateOverviewHTML(data: ReportData): string {
  return `
    ${generateInventoryHTML(data.inventory)}
    ${generateHouseholdHTML(data.household, data.householdGroups)}
    ${generateSustainabilityHTML(data.metrics, data.rationingScenarios, data.household)}
  `;
}

function generateInventoryCSV(inventory: InventoryItem[]): string {
  const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Expiration Date', 'Storage Location', 'Calories Per Unit', 'Usage Rate', 'Cost', 'Notes'];
  const rows = inventory.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.expirationDate || '',
    item.storageLocation,
    item.caloriesPerUnit || '',
    item.usageRatePerPersonPerDay,
    item.cost || '',
    item.notes || ''
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateHouseholdCSV(household: HouseholdMember[], groups: HouseholdGroup[]): string {
  const headers = ['Name', 'Age', 'Activity Level', 'Daily Calories', 'Daily Water (L)', 'Group', 'Skills', 'Medical Conditions', 'Emergency Contact'];
  const rows = household.map(member => {
    const group = groups.find(g => g.id === member.groupId);
    return [
      member.name,
      member.age,
      member.activityLevel,
      member.dailyCalories,
      member.dailyWaterLiters,
      group ? group.name : 'Ungrouped',
      member.skills?.join('; ') || '',
      member.medicalConditions?.join('; ') || '',
      member.emergencyContact || ''
    ];
  });
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateExpirationCSV(inventory: InventoryItem[]): string {
  const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Expiration Date', 'Days Until Expiry', 'Status', 'Location'];
  const today = new Date();
  
  const rows = inventory
    .filter(item => item.expirationDate)
    .sort((a, b) => {
      if (!a.expirationDate || !b.expirationDate) return 0;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    })
    .map(item => {
      const expDate = new Date(item.expirationDate!);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      const status = daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Good';
      
      return [
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.expirationDate!,
        daysUntilExpiry,
        status,
        item.storageLocation
      ];
    });
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateSustainabilityCSV(metrics: SustainabilityMetrics, scenarios: RationingScenario[]): string {
  const headers = ['Scenario', 'Reduction Percentage', 'Duration (Days)', 'Calories Per Person', 'Safety Status'];
  const rows = scenarios.map(scenario => {
    const duration = metrics.rationedUsageDays[scenario.id] || 0;
    const caloriesPerPerson = metrics.dailyCaloriesPerPerson[scenario.id] || 0;
    const isSafe = caloriesPerPerson >= 1200;
    
    return [
      scenario.name,
      scenario.reductionPercentage,
      duration,
      Math.round(caloriesPerPerson),
      isSafe ? 'Safe' : 'Critical'
    ];
  });
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateOverviewCSV(data: ReportData): string {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Inventory Items', data.inventory.length],
    ['Total Household Members', data.household.length],
    ['Total Groups', data.householdGroups.length],
    ['Normal Usage Days', data.metrics.normalUsageDays],
    ['Active Warnings', data.metrics.warningFlags.length],
    ['Total Daily Calories', data.household.reduce((sum, m) => sum + m.dailyCalories, 0)],
    ['Total Daily Water (L)', data.household.reduce((sum, m) => sum + m.dailyWaterLiters, 0).toFixed(1)],
    ['Preparedness Goal (Days)', data.settings.preparednessGoalDays],
    ['Climate Zone', data.settings.climateZone],
    ['Report Generated', new Date(data.generatedAt).toLocaleString()]
  ];
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}