import { SchoolStandard } from '../types';

export const SCHOOL_STANDARDS: SchoolStandard[] = [
  {
    id: 1,
    code: 'STD-1',
    titleKhmer: 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
    titleEnglish: 'Standard 1: Student Learning Outcomes',
    iconName: 'GraduationCap',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 2,
    code: 'STD-2',
    titleKhmer: 'ស្តង់ដាទី២៖ ដំណើរការបង្រៀន និងរៀន',
    titleEnglish: 'Standard 2: Teaching & Learning Process',
    iconName: 'BookOpen',
    color: 'blue',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 3,
    code: 'STD-3',
    titleKhmer: 'ស្តង់ដាទី៣៖ ការចូលរួមរបស់សហគមន៍',
    titleEnglish: 'Standard 3: Community Participation',
    iconName: 'Users',
    color: 'violet',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 4,
    code: 'STD-4',
    titleKhmer: 'ស្តង់ដាទី៤៖ ដំណើរការប្រតិបត្តិ និងរដ្ឋបាលសាលារៀន',
    titleEnglish: 'Standard 4: School Operation & Administration',
    iconName: 'Building2',
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 5,
    code: 'STD-5',
    titleKhmer: 'ស្តង់ដាទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
    titleEnglish: 'Standard 5: School Accountability',
    iconName: 'ShieldCheck',
    color: 'rose',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const parseNumberSafe = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export const formatCurrencyKhmer = (amount: number): string => {
  if (!amount && amount !== 0) return '0 ៛';
  return new Intl.NumberFormat('en-US').format(amount) + ' ៛';
};

export const formatNumberOnly = (amount: number): string => {
  if (!amount && amount !== 0) return '0';
  return new Intl.NumberFormat('en-US').format(amount);
};
