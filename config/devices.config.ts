import { devices } from '@playwright/test';

export interface DeviceProfile {
  name: string;
  use: Record<string, unknown>;
  tags?: string[];
}

export const mobileDevices: DeviceProfile[] = [
  {
    name: 'iPhone 14',
    use: {
      ...devices['iPhone 14'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['mobile', 'ios'],
  },
  {
    name: 'iPhone 14 Pro Max',
    use: {
      ...devices['iPhone 14 Pro Max'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['mobile', 'ios'],
  },
  {
    name: 'iPhone SE',
    use: {
      ...devices['iPhone SE'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['mobile', 'ios', 'small-screen'],
  },
  {
    name: 'Pixel 7',
    use: {
      ...devices['Pixel 7'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['mobile', 'android'],
  },
  {
    name: 'Galaxy S21',
    use: {
      ...devices['Galaxy S9+'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['mobile', 'android'],
  },
];

export const tabletDevices: DeviceProfile[] = [
  {
    name: 'iPad Pro 11',
    use: {
      ...devices['iPad Pro 11'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['tablet', 'ios'],
  },
  {
    name: 'iPad Mini',
    use: {
      ...devices['iPad Mini'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['tablet', 'ios'],
  },
  {
    name: 'Galaxy Tab S4',
    use: {
      ...devices['Galaxy Tab S4'],
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    },
    tags: ['tablet', 'android'],
  },
];

export const allDevices: DeviceProfile[] = [...mobileDevices, ...tabletDevices];

export const defaultMobileDevice = mobileDevices.find((d) => d.name === 'iPhone 14')!;
export const defaultAndroidDevice = mobileDevices.find((d) => d.name === 'Pixel 7')!;
export const defaultTabletDevice = tabletDevices.find((d) => d.name === 'iPad Pro 11')!;
