const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('leetcode_all_questions.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  fs.writeFileSync('public/leetcode_all_questions.csv', csv);
  console.log('✓ Converted leetcode_all_questions.xlsx to CSV');
} catch (error) {
  console.error('Error:', error.message);
}
