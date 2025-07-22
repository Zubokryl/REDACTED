export const licenseCoefficient = (type: 'personal' | 'commercial' | 'enterprise') => {
  switch (type) {
    case 'commercial':
      return 1.5;
    case 'enterprise':
      return 2.5;
    default:
      return 1;
  }
};