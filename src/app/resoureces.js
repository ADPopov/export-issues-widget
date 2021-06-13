import ExportJsonExcel from 'js-export-excel';

// eslint-disable-next-line max-len
const QUERY_TIME_TRACKING_FIELDS = '$type,workItems(created,text,type(name),creator($type,id,login,name,ringId),date,duration($type,minutes,presentation))';
// eslint-disable-next-line max-len
const QUERY_ISSUES_FIELDS = '$type,created,customFields($type,id,name,projectCustomField($type,field($type,fieldType($type,id),id,localizedName,name),id),value($type,id,name)),description,id,idReadable,links($type,direction,id,linkType($type,id,localizedName,name)),numberInProject,project($type,id,name,shortName),reporter($type,id,login,name,ringId),resolved,summary,updated,updater($type,id,login,name,ringId),usesMarkdown,visibility($type,id,permittedGroups($type,id,name,ringId),permittedUsers($type,id,login,name,ringId))';

export async function loadWorkItems(dashboardApi, serviceId, csv, params, fileName) {
  return await dashboardApi.downloadFile(
    serviceId,
    'api/export/issues?$top=-1',
    {
      method: 'POST',
      responseType: 'blob',
      headers: {
        Accept: 'text/csv'
      },
      body: params
    },
    fileName
  );
}

export function queryTimeTracking(fetch, YOUTRACK_SERVICE_ID, issuesID) {
  return fetch(
    YOUTRACK_SERVICE_ID, `api/issues/${issuesID}/timeTracking`,
    {
      query: {
        fields: QUERY_TIME_TRACKING_FIELDS
      }
    }
  );
}

export function queryIssues(fetch, YOUTRACK_SERVICE_ID, projectId) {
  return fetch(
    YOUTRACK_SERVICE_ID, `api/admin/projects/${projectId}/issues`,
    {
      query: {
        fields: QUERY_ISSUES_FIELDS
      }
    }
  );
}


export function onExport(headers, items, fileTitle) {
  const data = items; // json data
  const option = {};
  option.fileName = fileTitle;
  const keys = Object.keys(headers);
  const values = Object.values(headers);

  option.datas = [
    {
      sheetData: data,
      sheetName: 'list',
      sheetFilter: keys,
      sheetHeader: values,
      columnWidths: []
    }
  ];
  const toExcel = new ExportJsonExcel(option);
  console.log(toExcel)
  toExcel.saveExcel();
}

