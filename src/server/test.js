const a = [
  { label: 'a' },
  { label: 'a' },
  { label: 'b' },
  { label: 'b' },
  { label: 'c' },
  { label: 'c' },
];

const label = 'b';
const b = a.filter(datum => datum.label !== label);

console.log(b);
