import xlsx from 'xlsx';

const exportExcel = (data, workSheetColumnNames, workSheetName) => {
  const workBook = xlsx.utils.book_new();
  const workSheetData = [
    ["Отчет"],
    workSheetColumnNames,
    ...data
  ];
  console.log(workSheetData);
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
  xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
  xlsx.writeFile(workBook, workSheetName, {bookType:'xlsx'});
}

const exportIssuesToExcel = (issues, workSheetColumnNames, workSheetName, type) => {
  let data;
  switch (type) {
    case 'PROJECTS_REPORT':
      data = issues.map(issue => {
        return [
          issue.taskID,
          issue.summary,
          issue.project,
          issue.assignee,
          issue.created,
          issue.dueDate,
          issue.resolved,
          issue.state,
          issue.timeTracking,
          issue.url
        ];
      });
      break;
    case 'WEEKLY_REPORT':
      data = issues.map(issue => {
        return [
          issue.assignee,
          issue.project,
          issue.taskID,
          issue.created,
          issue.summary,
          issue.state,
          issue.timeTracking,
          issue.url
        ];
      });
      break;
    default:
      break;
  }
  exportExcel(data, workSheetColumnNames, workSheetName);
}

export default exportIssuesToExcel;
