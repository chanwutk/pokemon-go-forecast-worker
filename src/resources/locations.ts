export const locationIdToLocation = {
  '318849': 'กรุงเทพ',
  '318834': 'รามคำแหง',
  '320623': 'บางพลี',
  '320620': 'สมุทรปราการ',
  '318832': 'นนทบุรี',
  // '318835': 'บางเขน', // same as นนทบุรี
  '317582': 'ชลบุรี',
};

export type LocationId = keyof typeof locationIdToLocation;

export const locationIdToEngLocation: { [key in LocationId]: string } = {
  '318849': 'Bangkok',
  '318834': 'Ramkhamhaeng',
  '320623': 'Bang Phli',
  '320620': 'Samut Prakan',
  '318832': 'Nonthaburi',
  // '318835': 'Bang Khen', // same as นนทบุรี
  '317582': 'Chon Buri',
};
