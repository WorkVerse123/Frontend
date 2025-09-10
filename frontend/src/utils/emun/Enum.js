export const LAYOUT = {
  HEADER_HEIGHT: 64,   // px
  FOOTER_HEIGHT: 56,   // px
  SIDEBAR_WIDTH: 256,  // px (64 * 4)
};

export const DAY_MAP = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0
};


export const STEPS = [
  { id: 0, title: 'Thông tin doanh nghiệp' },
  { id: 1, title: 'Thông tin thành lập' },
  { id: 2, title: 'Hình ảnh' },
  { id: 3, title: 'Liên hệ' },
];

// map company type to numeric code (adjust if backend expects different)
export const TYPE_MAP = {
  'Private Limited': 1,
  'Public Company': 2,
  'Startup': 3,
  'NGO': 4,
  'Sole Proprietorship': 5,
  'Partnership': 6,
  'Other': 7,
};