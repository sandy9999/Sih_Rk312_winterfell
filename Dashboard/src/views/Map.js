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
import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import { DateTime } from "react-datetime-bootstrap";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  ListGroup,
  ListGroupItem,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { store } from "../store";

import userPin0 from "assets/img/userPin0.png";
import userPin1 from "assets/img/userPin1.png";
import userPin2 from "assets/img/userPin2.png";
import userPin3 from "assets/img/userPin3.png";
import userPin4 from "assets/img/userPin4.png";
import userPin5 from "assets/img/userPin5.png";
import { setGlobalCssModule } from "reactstrap/lib/utils";

const userPinArray = [
  userPin0,
  userPin1,
  userPin2,
  userPin3,
  userPin4,
  userPin5,
];

const Map = (props) => {
  const history = useHistory();

  // Map states
  const [viewPort, setViewPort] = useState({
    latitude: 13.007568,
    longitude: 80.25777,
    zoom: 12,
    width: "100%",
    height: "100%",
  });

  //Loading & others
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mode, setMode] = useState("basic");

  // Location Search
  const [searchLocations, setSearchLocations] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(0);

  // Querying
  const [areaRadius, setAreaRadius] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toString());
  const [timeOffset, setTimeOffset] = useState(30);

  const [userMarkers, setUserMarkers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetList, setTargetList] = useState([]);

  const [currHeatMapTarget, setCurrHeatMapTarget] = useState("");
  const [heatMapStartTime, setHeatMapStartTime] = useState(
    new Date("1971-01-01T00:00:00.000Z").toISOString()
  );
  const [heatMapEndTime, setHeatMapEndTime] = useState(
    new Date("2021-08-02T12:15:13.000Z").toISOString()
  );
  const [heatMapTargetList, setHeatMapTargetList] = useState([]);
  const [heatMapMarkers, setHeatMapMarkers] = useState({});

  //Context
  const { state: globalState, dispatch: globalStateDispatch } = useContext(
    store
  );

  // Location search
  const handleLocationSearch = async (loc) => {
    if (typingTimeout > 0) {
      clearTimeout(typingTimeout);
    }

    if (loc.length > 0) setIsLoading(true);
    else if (searchLocations.length) setSearchLocations([]);

    setTypingTimeout(
      setTimeout(async () => {
        if (loc.length) {
          const res = await fetch(
            `http://localhost:8080/cdr/getLocationsList`,
            {
              method: "POST",
              body: JSON.stringify({ data: loc }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          let list = await res.json();
          setSearchLocations((locs) => list.message);
        }
        setIsLoading(false);
      }, 2000)
    );
  };

  const handleSearchLocationSet = async (loc) => {
    setIsLoading(true);
    const res = await fetch(`http://localhost:8080/cdr/getLatLong`, {
      method: "POST",
      body: JSON.stringify({ data: loc }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let locData = await res.json();
    setSearchLocations([]);
    setIsLoading(false);

    setViewPort((curr) => {
      return {
        ...curr,
        latitude: locData.message.latitude,
        longitude: locData.message.longitude,
        zoom: 12,
      };
    });
  };

  // Querying
  const handleUsersQuery = async (e) => {
    setIsLoading(true);
    setUserMarkers([]);
    const payload = {
      refTime: selectedDate,
      duration: timeOffset,
      location: { lat: viewPort.latitude, long: viewPort.longitude },
      radius: areaRadius,
    };

    const res = await fetch(`http://localhost:8080/cdr/getRecords`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const usersData = await res.json();
    setUserMarkers(usersData.message);
    setIsLoading(false);
  };

  const handleUserGraphAdd = (e, selectedUser) => {
    if (
      targetList.findIndex((ele) => {
        return ele == selectedUser["callerNumber"];
      }) == -1
    )
      setTargetList((list) => [...list, selectedUser["callerNumber"]]);
  };

  const handleTargetUserDelete = (targetUser) => {
    const tempTargets = targetList.filter((e) => e != targetUser);
    setTargetList((list) => tempTargets);
  };

  // Heatmap
  const addToHeatMapList = (target) => {
    if (heatMapTargetList.length >= 10) {
      alert("Max 10 entries allowed in Heatmap");
      return;
    }
    if (
      heatMapTargetList.findIndex((e) => {
        return e == target;
      }) == -1
    )
      setHeatMapTargetList((list) => [...list, target]);
  };

  const deleteHeatMapTarget = (target) => {
    const tempTargets = heatMapTargetList.filter((e) => e != target);
    setHeatMapTargetList(tempTargets);
  };

  const handleHeatMapRender = async () => {
    setIsLoading(true);
    const payload = {
      startTime: heatMapStartTime,
      endTime: heatMapEndTime,
      numbers: heatMapTargetList,
    };

    const res = await fetch(`http://localhost:8080/cdr/getHeatMapLocations`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const usersData = await res.json();
    await setHeatMapMarkers((obj) => usersData["heatmaps"]);
    setIsLoading(false);
  };

  // Others
  const handleGoToGraph = (e) => {
    globalStateDispatch({ type: "SET_GRAPH_NODES", payload: targetList });
    history.push("/admin/graph");
  };

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  let processedMessage = JSON.parse(JSON.stringify(selectedUser))
  if(processedMessage){
    let newMessage = ""
    for(let field in processedMessage){
      if(field == "destLatLong" || field == "originLatLong"){
        newMessage += field
        newMessage += "\n"
        for(let field2 in processedMessage[field]){
          newMessage += field2
          newMessage += " : "
          newMessage += processedMessage[field][field2]
          newMessage += "\n"  
        }
      }else{
        newMessage += field
        newMessage += " : "
        newMessage += processedMessage[field]
        newMessage += "\n"  
      }
    }
    processedMessage = newMessage
  } 

  return (
    <>
      <div className="content" style={{ height: "80vh" }}>
        <Row>
          <Col lg="10" md="9">
            <Card className="card-plain">
              <CardHeader>Map Visual</CardHeader>
              <CardBody style={{ height: "100%" }}>
                <div
                  id="map"
                  className="map"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "80vh",
                  }}
                >
                  <ReactMapGL
                    {...viewPort}
                    mapStyle="mapbox://styles/shakeabi/ckd4edayj03ep1imofd8zee3t"
                    onViewportChange={(vp) => {
                      setViewPort(vp);
                    }}
                    mapboxApiAccessToken={process.env.REACT_APP_MAP_BOX_TOKEN}
                  >
                    <Marker
                      latitude={viewPort.latitude}
                      longitude={viewPort.longitude}
                      offsetLeft={-10}
                      offsetTop={-10}
                      anchor="bottom"
                    >
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src="https://dawiclinics.com/wp-content/uploads/2017/05/gray-location-icon-png-6-300x300.png"
                          height="40px"
                          width="40px"
                        />
                      </button>
                    </Marker>
                    {/* Basic mode markers */}
                    {userMarkers.length
                      ? userMarkers.map((ele, idx) => (
                          <Marker
                            latitude={parseFloat(ele.destLatLong.lat)}
                            longitude={parseFloat(ele.destLatLong.long)}
                            offsetLeft={0}
                            offsetTop={0}
                            anchor="bottom"
                            key={idx}
                          >
                            <button
                              style={{
                                background: "none",
                                border: "none",
                                outline: "none",
                                cursor: "pointer",
                              }}
                              onClick={(e) => setSelectedUser(ele)}
                            >
                              <img
                                src={userPinArray[0]}
                                height="40px"
                                width="40px"
                              />
                            </button>
                          </Marker>
                        ))
                      : null}
                    {selectedUser && (
                      <Popup
                        latitude={parseFloat(selectedUser.destLatLong.lat)}
                        longitude={parseFloat(selectedUser.destLatLong.long)}
                        closeOnClick={false}
                        onClose={(e) => {
                          setSelectedUser(null);
                        }}
                      >
                        <pre style={{ color: "black" }}>
                          {
                            processedMessage
                          }
                        </pre>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={
                            targetList.findIndex((ele) => {
                              return ele == selectedUser["callerNumber"];
                            }) != -1
                          }
                          onClick={(e) => {
                            handleUserGraphAdd(e, selectedUser);
                          }}
                        >
                          Add
                        </Button>
                      </Popup>
                    )}
                    {/* HeatMap markers */}
                    {Object.keys(heatMapMarkers).length &&
                      Object.keys(heatMapMarkers).map((ele, idx) => {
                        console.log("jeyyyy", userPinArray[idx]);
                        return (
                          <>
                            {heatMapMarkers[ele].map((item, index) => {
                              const tempItem = {
                                timestamp: item.timestamp,
                                destLatLong: item.location,
                              };
                              return (
                                <Marker
                                  latitude={parseFloat(item.location.lat)}
                                  longitude={parseFloat(item.location.long)}
                                  offsetLeft={0}
                                  offsetTop={0}
                                  anchor="bottom"
                                  key={index}
                                >
                                  <button
                                    style={{
                                      background: "none",
                                      border: "none",
                                      outline: "none",
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => setSelectedUser(tempItem)}
                                  >
                                    <img
                                      src={userPinArray[idx]}
                                      height="40px"
                                      width="40px"
                                      style={{opacity:0.5}}
                                    />
                                  </button>
                                </Marker>
                              );
                            })}
                          </>
                        );
                      })}
                  </ReactMapGL>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="3">
            <Card className="card-plain">
              <CardHeader style={{ minHeight: "50px" }}>
                <Row>
                  <Col>
                    <div
                      style={{
                        transform: "translate(0, -50%)",
                        position: "relative",
                        top: "50%",
                      }}
                    >
                      Controls
                    </div>
                  </Col>
                  {isLoading ? (
                    <Col>
                      <Spinner color="light" type="grow" />
                    </Col>
                  ) : null}
                </Row>
                <Row>
                  <Dropdown
                    isOpen={dropdownOpen}
                    toggle={toggle}
                    style={{ width: "100%" }}
                  >
                    <DropdownToggle style={{ width: "100%" }} caret>
                      {mode.toUpperCase()}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={(e) => setMode("basic")}>
                        Basic
                      </DropdownItem>
                      <DropdownItem onClick={(e) => setMode("heatmap")}>
                        Heatmap
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Row>
              </CardHeader>
              {mode == "basic" ? (
                <>
                  <CardBody
                    style={{ background: "#212529", borderRadius: "10px" }}
                  >
                    <Form>
                      <FormGroup>
                        <Input
                          style={{ color: "white" }}
                          plaintext
                          placeholder="Search for locations"
                          onChange={(e) => handleLocationSearch(e.target.value)}
                        />
                      </FormGroup>
                      {searchLocations.length > 0 ? (
                        <ListGroup style={{ cursor: "pointer" }}>
                          {searchLocations.map((ele, idx) => {
                            return (
                              <ListGroupItem
                                color="light"
                                action
                                key={idx}
                                onClick={(e) => {
                                  handleSearchLocationSet(ele);
                                }}
                              >
                                {ele}
                              </ListGroupItem>
                            );
                          })}
                        </ListGroup>
                      ) : null}
                    </Form>
                  </CardBody>
                  <CardBody
                    style={{
                      background: "#212529",
                      borderRadius: "10px",
                      marginTop: "20px",
                      color: "white",
                    }}
                  >
                    <Form>
                      <FormGroup>
                        <Label>Radius in kms (1-50)</Label>
                        <Input
                          style={{ color: "white" }}
                          type="number"
                          value={areaRadius}
                          placeholder="Radius in kms (1-50)"
                          onBlur={(e) => {
                            if (e.target.value == "" || e.target.value < 1)
                              e.target.value = 1;
                            if (e.target.value > 50) e.target.value = 50;
                            setAreaRadius(parseInt(e.target.value));
                          }}
                          onChange={(e) => {
                            setAreaRadius(parseInt(e.target.value));
                          }}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Time Offset</Label>
                        <Input
                          style={{ color: "white" }}
                          type="number"
                          min={0}
                          value={timeOffset}
                          onChange={(e) =>
                            setTimeOffset(parseInt(e.target.value))
                          }
                          placeholder="Time offset in mins"
                          // onChange={(e) => handleLocationSearch(e.target.value)}
                        />
                      </FormGroup>
                    </Form>
                    <Label>Date & Time</Label>
                    <DateTime
                      value={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                    />
                    <Button
                      color="primary"
                      style={{
                        margin: "10px auto",
                        display: "block",
                        width: "100%",
                      }}
                      onClick={handleUsersQuery}
                    >
                      Submit Query
                    </Button>
                  </CardBody>
                  <CardBody
                    style={{
                      background: "#212529",
                      borderRadius: "10px",
                      marginTop: "20px",
                      color: "white",
                    }}
                  >
                    Target List
                    {targetList.length ? (
                      <ListGroup
                        style={{ marginTop: "15px", cursor: "pointer" }}
                      >
                        {targetList.map((ele, idx) => {
                          return (
                            <ListGroupItem
                              color="light"
                              action
                              key={idx}
                              onClick={(e) => {
                                handleTargetUserDelete(ele);
                              }}
                            >
                              {ele}
                            </ListGroupItem>
                          );
                        })}
                      </ListGroup>
                    ) : null}
                    <Button
                      color="primary"
                      style={{
                        margin: "10px auto",
                        display: "block",
                        width: "100%",
                      }}
                      onClick={handleGoToGraph}
                    >
                      Go To Graph
                    </Button>
                  </CardBody>
                </>
              ) : mode == "heatmap" ? (
                <>
                  <CardBody
                    style={{ background: "#212529", borderRadius: "10px" }}
                  >
                    <Form>
                      <FormGroup>
                        <Label>Start Time</Label>
                        <DateTime
                          value={heatMapStartTime}
                          onChange={(date) => setHeatMapStartTime(date)}
                        />
                        <Label>End Time</Label>
                        <DateTime
                          value={heatMapEndTime}
                          onChange={(date) => setHeatMapEndTime(date)}
                        />
                      </FormGroup>
                    </Form>
                  </CardBody>
                  <CardBody
                    style={{
                      background: "#212529",
                      borderRadius: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <Form>
                      <FormGroup>
                        <Label>Target List - max 5</Label>
                        <Input
                          style={{ color: "white" }}
                          type="number"
                          onBlur={(e) => setCurrHeatMapTarget(e.target.value)}
                          placeholder="Enter target number"
                        />
                        <Button
                          color="primary"
                          style={{
                            margin: "10px auto",
                            display: "block",
                            width: "100%",
                          }}
                          onClick={(e) => addToHeatMapList(currHeatMapTarget)}
                        >
                          Add
                        </Button>
                      </FormGroup>
                    </Form>
                    {heatMapTargetList.length ? (
                      <ListGroup
                        style={{ marginTop: "15px", cursor: "pointer" }}
                      >
                        {heatMapTargetList.map((ele, idx) => {
                          return (
                            <ListGroupItem
                              color="light"
                              action
                              key={idx}
                              onClick={(e) => {
                                deleteHeatMapTarget(ele);
                              }}
                            >
                              {ele}
                            </ListGroupItem>
                          );
                        })}
                      </ListGroup>
                    ) : null}
                    <Button
                      color="primary"
                      style={{
                        margin: "10px auto",
                        display: "block",
                        width: "100%",
                      }}
                      onClick={handleHeatMapRender}
                    >
                      Render Heatmap
                    </Button>
                  </CardBody>
                </>
              ) : (
                <p>Invalid Mode</p>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Map;
