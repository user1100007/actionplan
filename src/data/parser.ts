import actionPlanRaw from './raw/action_plan.json';
import sofRaw from './raw/sof.json';
import efmsRaw from './raw/efms.json';
import { ActionPlanRow, SOFRow, EFMSRow } from '../types';
import { parseNumberSafe } from './standards';

function getRowValues(item: any): any[] {
  if (Array.isArray(item)) return item;
  if (typeof item === 'object' && item !== null) {
    const keys = Object.keys(item);
    if (keys.length > 0) return item[keys[0]];
  }
  return [];
}

export function parseActionPlan(): ActionPlanRow[] {
  const rows: ActionPlanRow[] = [];
  let currentStandardId = 1;
  let currentStandardTitle = 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស';
  let currentCategoryTitle = '';

  const rawList = Array.isArray(actionPlanRaw) ? actionPlanRaw : [];

  for (let i = 0; i < rawList.length; i++) {
    const cols = getRowValues(rawList[i]);
    if (!cols || cols.length === 0) continue;

    const col0 = String(cols[0] || '').trim();
    const col1 = String(cols[1] || '').trim();
    const col2 = String(cols[2] || '').trim();

    // Skip table column headers (row 0, 1, 2)
    if (col0 === 'ល.រ' || col0 === '1' || col0 === '2' || (col0 === '' && col1 === '' && col2 === '')) {
      continue;
    }

    // Check if Standard Header
    if (col0.includes('ស្តង់ដាទី១') || col0.includes('ស្តង់ដា ១')) {
      currentStandardId = 1;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី២') || col0.includes('ស្តង់ដា ២')) {
      currentStandardId = 2;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៣') || col0.includes('ស្តង់ដា ៣')) {
      currentStandardId = 3;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៤') || col0.includes('ស្តង់ដា ៤')) {
      currentStandardId = 4;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៥') || col0.includes('ស្តង់ដា ៥')) {
      currentStandardId = 5;
      currentStandardTitle = col0;
      continue;
    }

    // Check if Category header (e.g. "១. ការប្រមូលកុមារចូលរៀន", "២. សិស្សរៀនបានគង់វង្សក្នុងសាលារៀន")
    if ((col0.match(/^[១-៩០0-9]+\.\s+[^\d]/) || (!col0.includes('.') && col0.length < 5 && col1 === '' && col2 === '')) && col1 === '' && col2 === '') {
      currentCategoryTitle = col0;
      continue;
    }

    // Check if it's an Action Item row
    if (col0 || col1 || col2) {
      const stateFunding = parseNumberSafe(cols[8]);
      const communityFunding = parseNumberSafe(cols[9]);
      const partnerFunding = parseNumberSafe(cols[10]);
      let totalBudget = parseNumberSafe(cols[11]);
      if (totalBudget === 0 && (stateFunding > 0 || communityFunding > 0 || partnerFunding > 0)) {
        totalBudget = stateFunding + communityFunding + partnerFunding;
      }

      // Extract bullet points
      const rawText = col2 || '';
      const activities = rawText
        .split('\n')
        .map((s) => s.replace(/^[•\-\*\s]+/, '').trim())
        .filter((s) => s.length > 0);

      // Quarters Q1..Q4
      const q1Val = cols[3];
      const q2Val = cols[4];
      const q3Val = cols[5];
      const q4Val = cols[6];

      const quarters = {
        q1: Boolean(q1Val && q1Val !== '' && q1Val !== 0),
        q2: Boolean(q2Val && q2Val !== '' && q2Val !== 0),
        q3: Boolean(q3Val && q3Val !== '' && q3Val !== 0),
        q4: Boolean(q4Val && q4Val !== '' && q4Val !== 0),
      };

      // If all false, default to active in relevant quarters or all
      if (!quarters.q1 && !quarters.q2 && !quarters.q3 && !quarters.q4) {
        quarters.q1 = true;
        quarters.q2 = true;
        quarters.q3 = true;
        quarters.q4 = true;
      }

      rows.push({
        id: `act-${i}-${col0 || Math.random().toString(36).substring(2, 7)}`,
        standardId: currentStandardId,
        standardTitle: currentStandardTitle,
        categoryTitle: currentCategoryTitle || 'សកម្មភាពទូទៅ',
        activityCode: col0,
        expectedResult: col1,
        activities: activities.length > 0 ? activities : [rawText],
        rawActivityText: rawText,
        quarters,
        responsiblePerson: String(cols[7] || '').trim() || 'គណៈគ្រប់គ្រងសាលា និងលោកគ្រូ-អ្នកគ្រូ',
        funding: {
          state: stateFunding,
          community: communityFunding,
          partner: partnerFunding,
        },
        totalBudget,
      });
    }
  }

  return rows;
}

export function parseSOF(): SOFRow[] {
  const rows: SOFRow[] = [];
  let currentStandardId = 1;
  let currentStandardTitle = 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស';
  let currentCategory = '';

  const rawList = Array.isArray(sofRaw) ? sofRaw : [];

  for (let i = 0; i < rawList.length; i++) {
    const cols = getRowValues(rawList[i]);
    if (!cols || cols.length === 0) continue;

    const col0 = String(cols[0] || '').trim();
    const col1 = String(cols[1] || '').trim();
    const col2 = String(cols[2] || '').trim();

    if (col0 === 'ល.រ' || (col0 === '' && col1 === '' && col2 === '')) {
      continue;
    }

    // Standard header check
    if (col0.includes('ស្តង់ដាទី១') || col0.includes('ស្តង់ដា ១')) {
      currentStandardId = 1;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី២') || col0.includes('ស្តង់ដា ២')) {
      currentStandardId = 2;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៣') || col0.includes('ស្តង់ដា ៣')) {
      currentStandardId = 3;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៤') || col0.includes('ស្តង់ដា ៤')) {
      currentStandardId = 4;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៥') || col0.includes('ស្តង់ដា ៥')) {
      currentStandardId = 5;
      currentStandardTitle = col0;
      continue;
    }

    // Category header (e.g. "១", "ការប្រមូលកុមារចូលរៀន")
    if (col0 && !col0.includes('.') && col1 && !cols[2]) {
      currentCategory = `${col0}. ${col1}`;
      continue;
    }

    if (col0 || col1) {
      const budgetState = parseNumberSafe(cols[5]);
      const budgetNonState = parseNumberSafe(cols[6]);
      let budgetTotal = parseNumberSafe(cols[7]);
      if (budgetTotal === 0 && (budgetState > 0 || budgetNonState > 0)) {
        budgetTotal = budgetState + budgetNonState;
      }

      rows.push({
        id: `sof-${i}-${col0 || Math.random().toString(36).substring(2, 7)}`,
        standardId: currentStandardId,
        standardTitle: currentStandardTitle,
        categoryTitle: currentCategory || 'សូចនាករទូទៅ',
        indicatorCode: col0,
        indicatorTitle: col1,
        unit: col2 || '%',
        currentYearResultN: cols[3] ?? '',
        targetYearGoalNPlus1: cols[4] ?? '',
        budgetState,
        budgetNonState,
        budgetTotal,
      });
    }
  }

  return rows;
}

export function parseEFMS(): EFMSRow[] {
  const rows: EFMSRow[] = [];
  let currentStandardId = 1;
  let currentStandardTitle = 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស';
  let currentCategory = '';
  let lastMainRow: EFMSRow | null = null;

  const rawList = Array.isArray(efmsRaw) ? efmsRaw : [];

  for (let i = 0; i < rawList.length; i++) {
    const cols = getRowValues(rawList[i]);
    if (!cols || cols.length === 0) continue;

    const col0 = String(cols[0] || '').trim();
    const col1 = String(cols[1] || '').trim();

    if (col0 === 'ល.រ' || col0 === 'សរុប' || (col0 === '' && col1 === '')) {
      continue;
    }

    // Standard header check
    if (col0.includes('ស្តង់ដាទី១') || col0.includes('ស្តង់ដា ១')) {
      currentStandardId = 1;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី២') || col0.includes('ស្តង់ដា ២')) {
      currentStandardId = 2;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៣') || col0.includes('ស្តង់ដា ៣')) {
      currentStandardId = 3;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៤') || col0.includes('ស្តង់ដា ៤')) {
      currentStandardId = 4;
      currentStandardTitle = col0;
      continue;
    } else if (col0.includes('ស្តង់ដាទី៥') || col0.includes('ស្តង់ដា ៥')) {
      currentStandardId = 5;
      currentStandardTitle = col0;
      continue;
    }

    // Gender sub-row (e.g. "- ស្រី", "- ប្រុស")
    if (col0 === '' && (col1.includes('ស្រី') || col1.includes('ប្រុស'))) {
      if (lastMainRow) {
        if (!lastMainRow.genderRows) lastMainRow.genderRows = [];
        lastMainRow.genderRows.push({
          label: col1.replace(/^[-•\s]+/, '').trim(),
          nMinus1: cols[3] ?? '',
          currentN: cols[4] ?? '',
          targetNPlus2: cols[7] ?? '',
          targetNPlus3: cols[8] ?? '',
        });
      }
      continue;
    }

    // Category header (e.g. "១", "ការប្រមូលកុមារចូលរៀន")
    if (col0 && !col0.includes('.') && col1 && (!cols[6] || String(cols[6]).trim() === '')) {
      currentCategory = `${col0}. ${col1}`;
      continue;
    }

    if (col0 || col1) {
      const rowItem: EFMSRow = {
        id: `efms-${i}-${col0 || Math.random().toString(36).substring(2, 7)}`,
        standardId: currentStandardId,
        standardTitle: currentStandardTitle,
        categoryTitle: currentCategory || 'សូចនាករទូទៅ',
        indicatorCode: col0,
        indicatorTitle: col1,
        budgetNPlus1: parseNumberSafe(cols[2]),
        historyNMinus1: cols[3] ?? '',
        currentYearN: cols[4] ?? '',
        targetNPlus1: cols[5] ?? '',
        reasonForChange: String(cols[6] || '').trim(),
        targetNPlus2: cols[7] ?? '',
        targetNPlus3: cols[8] ?? '',
        genderRows: [],
      };
      rows.push(rowItem);
      lastMainRow = rowItem;
    }
  }

  return rows;
}
