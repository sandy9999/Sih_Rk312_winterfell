/*!

=========================================================
* Black Dashboard React v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar, Pie } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4,
  graphDataFormat,
  pieExample
} from "variables/charts.js";

const config = require("../config.js")

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    let cdrCounts = []
    let ipdrCounts = [11,21,31,41,15,6,1,0,0,0,0,0]
    let smsCounts = [11,5,35,42,25,36,5,0,0,0,0,0]
    let highestCallers = [
      {caller : "Ram", duration : 53},
      {caller :  "Sandhya", duration : 20},
      {caller :  "9874561230", duration : 110},
      {caller :  "Hrishi", duration : 80},
      {caller :  "9874563211", duration : 100}
    ]

    for(let i = 1; i <= 12; ++i){
      cdrCounts.push(0)
      ipdrCounts.push(0)
    }

    this.state = {
      bigChartData: "data1",
      cdrCounts : cdrCounts,
      ipdrCounts : ipdrCounts,
      smsCounts: smsCounts,
      notes : [],
      cdrRecords : [],
      highestCallers : highestCallers
    };

    // Getting the CDR Statistics
    fetch(`${config.BASE_URL}/cdr/getStatistics/`)
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        this.setState({
          cdrCounts : data.cdrCounts,
          smsCounts : data.smsCounts,
          highestCallers : data.highestCallers
        })
      })
      .catch((err) => console.log(err))

    // Get IPDR Data and update counts
    fetch(`${config.BASE_URL}/ipdr/getStatistics/`)
      .then(response => response.json())
      .then((data) => {
        this.setState({
          ipdrCounts : data.ipdrCounts
        })
      })
      .catch((err) => console.log(err))

    // Getting all the notes stored in the DB
    fetch(`${config.BASE_URL}/note/getAllNotes/`)
    .then(response => response.json())
      .then((data) => {
        let allNotes = []
        for(let note of data.message){
          let src = note.srcNumber
          let dest = note.destNumber
          let subNotes = note.notes
          for(let subNote of subNotes){
            allNotes.push({
              title : "Src : " + src + ", Dest : " + dest,
              text : subNote
            })
          }
        }
        this.setState({
          notes : allNotes
        })
      })
      .catch((err) => console.log(err))

      // Getting all CDR records
    fetch(`${config.BASE_URL}/cdr/getAllRecords/`)
    .then(response => response.json())
      .then((data) => {
        let cdrData = []
        for(let record of data){
          cdrData.push({
            callerNumber : record.callerNumber,
            calledNumber : record.calledNumber,
            callDuration : record.callDuration,
            callType : record.callType 
          })
        }

        this.setState({
          cdrRecords : cdrData
        })
      })
      .catch((err) => console.log(err))

  }

  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };
  render() {
    let graphData = Object.assign({}, graphDataFormat)
    let callDurationData = Object.assign({}, chartExample3.data)

    // Splitting highest callers into labels and durations
    let highestLabels = []
    let highestDurations = []
    let totalCallDuration = 0
    for(let highestCaller of this.state.highestCallers){
      highestLabels.push(highestCaller.caller)
      highestDurations.push(highestCaller.duration)
      totalCallDuration += highestCaller.duration
    }
    callDurationData.labels = highestLabels
    callDurationData.datasets[0].data = highestDurations 

    // Getting the graph data
    if(this.state.bigChartData === "data1"){      
      graphData.datasets[0].data = this.state.cdrCounts
    }else if(this.state.bigChartData === "data2"){
      graphData.datasets[0].data = this.state.ipdrCounts
    }else if(this.state.bigChartData === "data3"){
      graphData.datasets[0].data = this.state.smsCounts
    }

    // Getting all the note data
    let numNotes = this.state.notes.length

    // Creating all the note components
    let notes = this.state.notes
    let key = 0
    function createNote (note) {
      key += 1
      return (
        <tr key={key}>
          <td>
            <p className="title"> {note.title} </p>
            <p className="text-muted">
              {note.text}
            </p>
          </td>
        </tr> 
      );
    }

    // Creating a note component for each note
    let noteComponents = notes.map(createNote)

    // Creating all the CDR record component
    let records = this.state.cdrRecords
    function createCDRRecord (record){
      key += 1
      return (
        <tr key={key}>
          <td>{record.callerNumber}</td>
          <td>{record.calledNumber}</td>
          <td>{record.callDuration}</td>
          <td className="text-center">{record.callType}</td>
        </tr>
      )
    }
    
    let recordComponents = records.map(createCDRRecord)

    return (
      <>
        <div className="content">
          <Row>
            <Col xs="12">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" sm="6">
                      <h5 className="card-category"></h5>
                      <CardTitle tag="h2">Total CDR & IPDR Records</CardTitle>
                    </Col>
                    <Col sm="6">
                      <ButtonGroup
                        className="btn-group-toggle float-right"
                        data-toggle="buttons"
                      >
                        <Button
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data1"
                          })}
                          color="info"
                          id="0"
                          size="sm"
                          onClick={() => this.setBgChartData("data1")}
                        >
                          <input
                            defaultChecked
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            CALLS
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-single-02" />
                          </span>
                        </Button>
                        <Button
                          color="info"
                          id="1"
                          size="sm"
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data2"
                          })}
                          onClick={() => this.setBgChartData("data2")}
                        >
                          <input
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            IPDR
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-gift-2" />
                          </span>
                        </Button>
                        <Button
                          color="info"
                          id="2"
                          size="sm"
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data3"
                          })}
                          onClick={() => this.setBgChartData("data3")}
                        >
                          <input
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            SMS
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-tap-02" />
                          </span>
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={graphData}
                      options={chartExample1.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Applications used</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-wifi text-info" />{" "}
                    1630 hours
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Pie
                      data={pieExample.data}
                      options={pieExample.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Maximum Call Durations</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-chat-33 text-primary" />{" "}
                    {totalCallDuration} mins
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Bar
                      data={callDurationData}
                      options={chartExample3.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">People with criminal history</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-send text-success" /> 530 mins
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={chartExample2.data}
                      options={chartExample2.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="6" md="12">
              <Card className="card-tasks">
                <CardHeader>
                  <h6 className="title d-inline">Notes({numNotes})</h6>
                  <p className="card-category d-inline"> Latest</p>
                </CardHeader>
                <CardBody>
                  <div className="table-full-width table-responsive">
                    <Table>
                      <tbody>
                        {noteComponents}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6" md="12">
              <Card>
                <CardHeader style={{overflowY : "hidden", height : "10px"}}>
                  <CardTitle tag="h4">CDR Data</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Source Number</th>
                        <th>Destination Number</th>
                        <th>Call Duration</th>
                        <th className="text-center">Call Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordComponents}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Dashboard;
