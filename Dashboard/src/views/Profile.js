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
  CardFooter,
  Form,
  FormGroup,
  ListGroup,
  ListGroupItem,
  Input,
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
  pieExample,
  pieTopCalls
} from "variables/charts.js";


class Profile extends React.Component {
  constructor(props) {
    super(props);
    let cdrCounts = []
    let ipdrCounts = []
    let smsCounts = []
    for(let i = 1; i <= 12; ++i){
      cdrCounts.push(0)
      ipdrCounts.push(0)
      smsCounts.push(0)
    }
    
    this.state = {
      srcNumber: "9696122597",
      bigChartData: "data1",
      cdrCounts : cdrCounts,
      ipdrCounts : ipdrCounts,
      smsCounts : smsCounts,
      notes : [],
      cdrRecords : [], 
      ipdrRecords: [],
      name: "",
      associatedPhoneNumbers: [], 
      imei :"",
      associatedImeis: "",
      imsi: "",
      email: "",
      aadharNumber: "",
      remarks: "",
      topCallLabels: [],
      topCallFreqs: [],
      totalCalls: 0
    
    };
    // Getting all the profile details for the number
    fetch("http://localhost:8080/profile/getUserDetails/", {
      method: "POST",
      body: JSON.stringify({ number: this.state.srcNumber }),
      headers: {
          'Content-Type': 'application/json'
    }})
    .then(response => response.json())
      .then((data) => {
        console.log("pofile",data);
        // get notes of user
        let allNotes = []
        for(let note of data.notes){
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
        // get cdr data of user
        let cdrData = []
        for(let record of data.cdrRecords){
          cdrData.push({
            callerNumber : record.callerNumber,
            calledNumber : record.calledNumber,
            callDuration : record.callDuration,
            callType : record.callType 
          })
        }

        // get ipdr data of user
        let ipdrData = []
        for(let record of data.ipdrRecords){
          ipdrData.push({
            sourceIP : record.publicIP,
            sourcePort : record.publicPort,
            destIP : record.destIP,
            destPort : record.destPort,
            totalVolume : record.totalVolume
          })
        }

        // get pie chart labels, values for most frequent calls
        let topCallFreqs = [];
        let topCallLabels = [];
        let totalCalls = 0;
        for(let caller of data.topCallers){
          topCallLabels.push(caller.caller)
          topCallFreqs.push(caller.numCalls)
          totalCalls += caller.numCalls;
        }

        this.setState({
          name: data.profileData.name,
          associatedPhoneNumbers: data.profileData.associatedPhoneNumbers, 
          imei :data.profileData.imei,
          associatedImeis: data.profileData.associatedImeis,
          imsi: data.profileData.imsi,
          email: data.profileData.email,
          aadharNumber: data.profileData.aadharNumber,
          remarks: data.profileData.remarks,
          notes : allNotes,
          cdrRecords : cdrData,
          ipdrRecords: ipdrData,
          topCallLabels: topCallLabels,
          topCallFreqs: topCallFreqs,
          totalCalls: totalCalls
        })
      })
      .catch((err) => console.log(err))
    
    // Getting the CDR Statistics
    fetch("http://localhost:8080/cdr/getSinglePhoneStatistics", {
      method: "POST", 
      body: JSON.stringify({phoneNumber: this.state.srcNumber}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((data) => {
      this.setState({
        cdrCounts : data.cdrCounts
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
    let pieData = {}
    // Getting the top callers pie data
    pieData = pieTopCalls
    pieData.labels = this.state.topCallLabels
    pieData.datasets[0].data = this.state.topCallFreqs
    
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
    let cdrRecords = this.state.cdrRecords;
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
    let callRecordComponents = cdrRecords.map(createCDRRecord)
    
    // Creating all the IPDR record components
    let ipdrRecords = this.state.ipdrRecords;
    function createIPDRRecord (record){
      key += 1
      return (
        <tr key={key}>
          <td>{record.sourceIP}</td>
          <td>{record.sourcePort}</td>
          <td>{record.destIP}</td>
          <td>{record.destPort}</td>
          <td>{record.totalVolume}</td>
        </tr>
      )
    }
    let ipRecordComponents = ipdrRecords.map(createIPDRRecord)

    let updateProfile = () => {
      fetch("http://localhost:8080/profile/updateUser", {
      method: "POST", 
      body: JSON.stringify({
        refNumber: this.state.srcNumber,
        name: this.state.name,
        email: this.state.email,
        aadharNumber: this.state.aadharNumber,
        remarks: this.state.remarks,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((data) => {
      // todo add notification
      console.log("Data saved successfully")
    })
    .catch((err) => console.log(err))
    }

    let handleProfileChange = (element, value) => {
      console.log(value)
      let newState = this.state;
      newState[element] = value
      this.setState({
        newState
      })
    }

    return (
      <>
      <div className="content">
        
        {/* editable profile */}
              <Card>
                <CardHeader>
                  <h5 className="title">Profile</h5>
                </CardHeader>
                <CardBody>
                  <Form>
                    <Row>
                      <Col className="pr-md-1" md="4">
                        <FormGroup>
                          <label>Phone</label>
                          <Input
                            defaultValue={this.state.srcNumber}
                            disabled
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col className="px-md-1" md="4">
                        <FormGroup>
                          <label>IMEI</label>
                          <Input
                            defaultValue={this.state.imei}
                            disabled
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col className="pl-md-1" md="4">
                        <FormGroup>
                          <label>
                            IMSI
                          </label>
                          <Input
                            type="text"
                            defaultValue={this.state.imsi}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="pr-md-1" md="4">
                        <FormGroup>
                          <label>Name</label>
                          <Input
                            type="text"
                            defaultValue={this.state.name}
                            onChange={(e) => {
                              handleProfileChange("name",e.target.value)
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col className="px-md-1" md="4">
                        <FormGroup>
                          <label htmlFor="exampleInputEmail">Email Address</label>
                          <Input 
                           type="email"
                           defaultValue={this.state.email}
                           onChange={(e) => {
                            handleProfileChange("email",e.target.value)
                            }}
                           placeholder="mike@email.com"
                          />
                        </FormGroup>
                      </Col>
                      <Col className="p1-md-1" md="4">
                        <FormGroup>
                          <label>Aadhar Number</label>
                          <Input
                            defaultValue={this.state.aadharNumber}
                            onChange={(e) => {
                              handleProfileChange("aadharNumber",e.target.value)
                            }}
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <label>Associated Phone Numbers</label>
                    {
                    this.state.associatedPhoneNumbers && this.state.associatedPhoneNumbers.map((value, key) => {
                      return <ListGroup key={key}>
                          {value}
                      </ListGroup>
                    })}
                    <br />
                    <label>Associated IMEIs</label>
                    {
                    this.state.associatedImeis && this.state.associatedImeis.map((value, key) => {
                      return <ListGroup key={key}>
                          {value}
                      </ListGroup>
                    })}
                    
                    
                    <Row>
                      <Col md="8">
                        <FormGroup>
                          <label>Remarks</label>
                          <Input
                            cols="80"
                            defaultValue={this.state.remarks}
                            placeholder="Here can be your description"
                            rows="4"
                            type="textarea"
                            onChange={(e) => {
                              handleProfileChange("remarks",e.target.value)
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button className="btn-fill" color="secondary" type="submit" onClick={updateProfile}>
                    Save
                  </Button>
                </CardFooter>
              </Card>

        {/* stats about the profile */}
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
                            CDR
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
                  <h5 className="card-category">Top 5 callers</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-chat-33 text-info" />{" "}
                    {this.state.totalCalls} calls 
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                  <Pie
                      data={pieData}
                      options={pieExample.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Top App usage</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-app text-primary" />{" "}
                    500 mins
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Bar
                      data={{
                        labels: ["Whatsapp", "Facebook", "Telegram", "Discord", "Browser"],
                        datasets: [
                          {
                            label: "Duration",
                            fill: true,
                            borderColor: "#d048b6",
                            borderWidth: 2,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            data: [90, 120, 110, 80, 100]
                          }
                        ]
                    }}
                      options={chartExample3.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
            <Card className="card-tasks" style={{maxHeight: "330px", overflow: "auto"}}>
                <CardHeader>
                  <h6 className="title d-inline">Notes({numNotes})</h6>
                  <p className="card-category d-inline"> Latest </p>
                  </CardHeader>
                <CardBody>
                  <div className="table-full-width">
                    <Table>
                      <tbody>
                        {noteComponents}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="6" md="12">
            <Card style={{maxHeight:"500px", overflow:"auto"}}>
                <CardHeader>
                  <CardTitle tag="h4">IPDR Data</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter">
                    <thead className="text-primary">
                      <tr>
                        <th>Source IP</th>
                        <th>Source Port</th>
                        <th>Destination IP</th>
                        <th>Destination Port</th>
                        <th>Total data volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ipRecordComponents}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6" md="12">
              <Card style={{maxHeight:"500px", overflow:"auto"}}>
                <CardHeader>
                  <CardTitle tag="h4">CDR Data</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter">
                    <thead className="text-primary">
                      <tr>
                        <th>Source Number</th>
                        <th>Destination Number</th>
                        <th>Call Duration</th>
                        <th className="text-center">Call Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callRecordComponents}
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

export default Profile;
