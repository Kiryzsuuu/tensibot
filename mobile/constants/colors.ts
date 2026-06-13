export const Colors = {
  primary: '#2E86C1',
  primaryDark: '#154360',
  primaryLight: '#EAF4FB',
  primaryMid: '#AED6F1',
  text: '#1A2A3A',
  textMuted: '#5D8AA8',
  border: '#D6E8F5',
  background: '#F4F8FC',
  white: '#FFFFFF',
  success: '#16a34a',
  warning: '#F5A623',
  danger: '#C0392B',
  crisis: '#7f1d1d',
} as const;

export const BPColors: Record<string, string> = {
  NORMAL: '#16a34a',
  ELEVATED: '#ca8a04',
  STAGE_1: '#ea580c',
  STAGE_2: '#dc2626',
  CRISIS: '#7f1d1d',
};

export const BPLabels: Record<string, string> = {
  NORMAL: 'Normal',
  ELEVATED: 'Elevasi',
  STAGE_1: 'Stage 1',
  STAGE_2: 'Stage 2',
  CRISIS: 'Krisis',
};
