import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import DashboardAddons from 'hub-dashboard-addons';
import Permissions from '@jetbrains/hub-widget-ui/dist/permissions';

import {Button, Col, DatePicker, Grid, Row} from '@jetbrains/ring-ui';
import Select from '@jetbrains/ring-ui/components/select/select';

import '@jetbrains/ring-ui/components/input-size/input-size.scss';
import '@jetbrains/ring-ui/components/form/form.scss';
import {onExport, queryIssues, queryTimeTracking} from './resoureces';
import exportIssuesToExcel from './service/exportService';

import styles from './app.css';

const YOUTRACK_SERVICE_ID = 'c37647ec-76f9-45b2-85ac-26f8c6fe1d28';

const weeklyReport = "WEEKLY_REPORT";
const projectReport = "PROJECTS_REPORT";

class Widget extends Component {
  static propTypes = {
    dashboardApi: PropTypes.object,
    permissions: PropTypes.object,
    registerWidgetApi: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      isConfiguring: false,
      selectedProject: null,
      projects: [],
      from: new Date().getDate(),
      to: new Date().getDate(),
      selectedType: null,
      showProjects: false,
      periodValue: 'choicePeriod',
      showRadioButtons: false,
      showDateWithRange: true,
      day: new Date()
    };
  }

  componentDidMount() {
    const {dashboardApi} = this.props;
    this.initialize(this.props.dashboardApi);
    Permissions.init(dashboardApi).then(() => this.setState({permissions: Permissions}));
  }

  setRange = ({from, to}) => {
    this.setState({from, to});
  }

  checkDateEntrance = (date, from, to) => {
    if (date >= new Date(from) && date <= new Date(to)) {
      return true;
    } else {
      return false;
    }
  }

  getDate() {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('ru-RU');
  }

  createReport = async () => {
    const {selectedProject} = this.state;
    const {selectedType} = this.state;
    let filtersIssues = [];
    let duration = 0;

    const headersWeeklyReport = [
      'Ответственный',
      'Проект',
      'ID задачи',
      'Создано',
      'Название',
      'Статус',
      'Общее затраченное время',
      'Ссылка'
    ];

    const headers = [
      'ID задачи',
      'Название',
      'Проект',
      'Ответственный',
      'Создано',
      'Срок',
      'Дата исполнения',
      'Статус',
      'Общее затраченное время',
      'Ссылка',
    ];

    const fetch = this.props.dashboardApi.fetch;
    const minutesInHour = 60;

    if (selectedType.key === 1) {
      const {projects} = this.state;
      const allData = [];
      for (const project of projects) {
        const issues = await queryIssues(fetch, YOUTRACK_SERVICE_ID, project.id);
        filtersIssues = filtersIssues.concat(issues);
      }
      for (const i of filtersIssues) {
        console.log(filtersIssues)
        if (this.checkDateEntrance(i.created, this.state.from, this.state.to)) {
          const timeTrack = await queryTimeTracking(fetch, YOUTRACK_SERVICE_ID, i.id);
          timeTrack.workItems.forEach(d => {
            duration += d.duration.minutes;
          });
          allData.push({
            assignee: i.customFields.filter(e => e.name === 'Assignee')[0].value.name,
            project: i.project.name,
            taskID: i.idReadable,
            created: new Date(i.created),
            summary: i.summary,
            state: i.customFields.filter(e => e.name === 'State')[0].value.name,
            timeTracking: duration / minutesInHour,
            url: `https://sk5-cod-youtrack-test.at.urfu.ru:8443/issue/${i.idReadable}`
          });
        }
        duration = 0;
      }
      console.log(allData);
      exportIssuesToExcel(allData, headersWeeklyReport, 'report.xlsx', weeklyReport);
      //onExport(headersWeeklyReport, allData, `Еженедельный отчет ${this.getDate()}`);
    } else if (selectedType.key === 2) {
      const issues = await queryIssues(fetch, YOUTRACK_SERVICE_ID, selectedProject.key);
      for (const i of issues) {
        if (this.checkDateEntrance(i.created, this.state.from, this.state.to)) {
          let timeTrack = [];
          timeTrack = await queryTimeTracking(fetch, YOUTRACK_SERVICE_ID, i.id);
          timeTrack.workItems.forEach(d => {
            duration += d.duration.minutes;
          });
          filtersIssues.push({
            taskID: i.idReadable,
            summary: i.summary,
            project: i.project.name,
            assignee: i.customFields.filter(e => e.name === 'Assignee')[0].value.name,
            created: new Date(i.created),
            dueDate: new Date(i.customFields.filter(e => e.name === 'Срок')[0].value),
            resolved: new Date((i.resolved != null) ? i.resolved : ''),
            state: i.customFields.filter(e => e.name === 'State')[0].value.name,
            timeTracking: duration / minutesInHour,
            url: `https://sk5-cod-youtrack-test.at.urfu.ru:8443/issue/${i.idReadable}`
          });
        }
        duration = 0;
      }
      exportIssuesToExcel(filtersIssues, headers, 'report.xlsx', projectReport);
      //onExport(headers, filtersIssues, `Отчет по проекту ${selectedProject.label} ${this.getDate()}`);
    } else if (selectedType.key === 3) {
      const {projects} = this.state;
      const allData = [];
      for (const project of projects) {
        const issues = await queryIssues(fetch, YOUTRACK_SERVICE_ID, project.id);
        filtersIssues = filtersIssues.concat(issues);
      }

      for (const i of filtersIssues) {
        if (this.checkDateEntrance(i.created, this.state.from, this.state.to)) {
          let timeTrack = [];
          timeTrack = await queryTimeTracking(fetch, YOUTRACK_SERVICE_ID, i.id);
          timeTrack.workItems.forEach(d => {
            duration += d.duration.minutes;
          });
          allData.push({
            taskID: i.idReadable,
            summary: i.summary,
            project: i.project.name,
            assignee: i.customFields.filter(e => e.name === 'Assignee')[0].value.name,
            created: new Date(i.created),
            dueDate: new Date(i.customFields.filter(e => e.name === 'Срок')[0].value),
            resolved: new Date((i.resolved != null) ? i.resolved : ''),
            state: i.customFields.filter(e => e.name === 'State')[0].value.name,
            timeTracking: duration,
            url: `https://sk5-cod-youtrack-test.at.urfu.ru:8443/issue/${i.idReadable}`
          });
        }
        duration = 0;
      }
      exportIssuesToExcel(allData, headers, 'report.xlsx', projectReport);

      //onExport(headers, allData, `Отчет по всем проектам ${this.getDate()}`);
    }
  }

  changeTypeReport = selectedType => {
    if (selectedType.key === 2) {
      this.setState({showProjects: true, showRadioButtons: true, periodValue: 'choicePeriod'});
    } else {
      this.setState({showProjects: false});
    }
    if (selectedType.key === 3) {
      this.setState({showRadioButtons: true, periodValue: 'choicePeriod'});
    } else if (selectedType.key === 1) {
      this.setState({showRadioButtons: false, showDateWithRange: true});
    }

    this.setState({selectedType});
  }

  changeSelectedProjects = selectedProject => {
    this.setState({selectedProject});
  }

  async initialize(dashboardApi) {
    const [projects] = await Promise.all([
      dashboardApi.fetch(YOUTRACK_SERVICE_ID, 'api/admin/projects',
        {
          query: {
            fields: 'id,name'
          }
        }
      )
    ]);

    this.setState({projects});

    const dateInMs = new Date().getTime();
    const to = new Date(dateInMs);
    const from = new Date(to - 604800000);

    this.setState({to, from});
  }

  renderTypeReportSelector() {
    const typeReports = [
      {label: 'Еженедельный отчет', key: 1},
      {label: 'Отчет по проекту', key: 2},
      {label: 'Отчет по всем проектам', key: 3}
    ];

    return (
      <Select
        label="Выберите форму отчета"
        filter={true}
        selectedLabel="Форма отчета"
        data={typeReports}
        onChange={this.changeTypeReport}
      />
    );
  }

  renderProjectSelector() {
    const projects = this.state.projects.map(p => ({
      label: p.name,
      key: p.id
    }));

    return (
      <Select
        label="Выберите проект"
        filter={true}
        selectedLabel="Проект"
        data={projects}
        onChange={this.changeSelectedProjects}
      />
    );
  }

  setDate = date => {
    this.setState({day: date});
  }

  renderDateWithRange() {
    return (
      <DatePicker
        from={this.state.from}
        to={this.state.to}
        onChange={this.setRange}
        range={true}
      />
    );
  }

  render() {
    return (
      <div className={styles.widget}>
        <Grid data-test="auto-size">
          <Row>
            <Col xs={15}>
              {this.renderTypeReportSelector(this.changeTypeReport)}
            </Col>
            <Col xs={1}>
              {this.state.showProjects ? this.renderProjectSelector() : null}
            </Col>
          </Row>
          <Row>
            <Col>
              {this.state.showDateWithRange ? this.renderDateWithRange() : null}
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                onMouseDown={this.createReport}
                children="Создать отчет"
                primary={true}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

DashboardAddons.registerWidget((dashboardApi, registerWidgetApi) => {
  render(
    <Widget
      dashboardApi={dashboardApi}
      registerWidgetApi={registerWidgetApi}
    />,
    document.getElementById('app-container')
  );
});

