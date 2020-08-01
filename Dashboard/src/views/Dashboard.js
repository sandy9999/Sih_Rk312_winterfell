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
import { Line, Bar } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4,
  graphDataFormat
} from "variables/charts.js";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    let cdrCounts = []
    let ipdrCounts = []
    for(let i = 1; i <= 12; ++i){
      cdrCounts.push(0)
      ipdrCounts.push(0)
    }

    this.state = {
      bigChartData: "data1",
      cdrCounts : cdrCounts,
      ipdrCounts : ipdrCounts,
      notes : [],
      cdrRecords : []
    };

        
    // Getting the CDR Statistics
    fetch("http://localhost:8080/cdr/getStatistics/")
      .then(response => response.json())
      .then((data) => {
        this.setState({
          cdrCounts : data.cdrCounts
        })
      })
      .catch((err) => console.log(err))

    // TODO : Get IPDR Data and update counts

    // Getting all the notes stored in the DB
    fetch("http://localhost:8080/note/getAllNotes/")
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
    fetch("http://localhost:8080/cdr/getAllRecords/")
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
    let graphData = {}
    
    // Getting the graph data
    if(this.state.bigChartData === "data1"){
      graphData = graphDataFormat
      graphData.datasets[0].data = this.state.cdrCounts
    }else if(this.state.bigChartData === "data2"){
      graphData = graphDataFormat
      graphData.datasets[0].data = this.state.ipdrCounts
    }else if(this.state.bigChartData === "data3"){
      graphData = graphDataFormat
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
            <FormGroup check>
              <Label check>
                <Input defaultValue="" type="checkbox" />
                <span className="form-check-sign">
                  <span className="check" />
                </span>
              </Label>
            </FormGroup>
          </td>
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
                            CPDR
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
                            Field 3
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
                  <h5 className="card-category">Total Shipments</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" />{" "}
                    763,215
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
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Daily Sales</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-delivery-fast text-primary" />{" "}
                    3,500€
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Bar
                      data={chartExample3.data}
                      options={chartExample3.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Completed Tasks</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-send text-success" /> 12,100K
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={chartExample4.data}
                      options={chartExample4.options}
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
                  <p className="card-category d-inline"> today</p>
                  <UncontrolledDropdown>
                    <DropdownToggle
                      caret
                      className="btn-icon"
                      color="link"
                      data-toggle="dropdown"
                      type="button"
                    >
                      <i className="tim-icons icon-settings-gear-63" />
                    </DropdownToggle>
                    <DropdownMenu aria-labelledby="dropdownMenuLink" right>
                      <DropdownItem
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        Action
                      </DropdownItem>
                      <DropdownItem
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        Another action
                      </DropdownItem>
                      <DropdownItem
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        Something else
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
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
                <CardHeader>
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