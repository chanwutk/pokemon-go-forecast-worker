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