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

// reactstrap components
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";
import React, { useState, useEffect, useContext } from 'react';
import GraphWrapper from "./GraphWrappers/GraphWrapper"
import { store } from "../store";
import "./GraphWrappers/GraphWrapper.css"
import FixedPlugin from "../components/FixedPlugin/FixedPlugin.js";



export default function Typography() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  // state to filter call duration, number of calls
  const [callDuration, setCallDuration] = useState(0);
  const [numberOfCalls, setNumberOfCalls] = useState(0);

  const [graphReady, setGraphReady] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState();
  const [open, setOpen] = useState(true);
  const [clickedNode, setClickedNode] = useState();
  const [showCard, setShowCard] = useState(false);
  const [cardStatus, setCardStatus] = useState(0); //0 nothing 1 Profile 2 Logs
  const [details, setDetails] = useState();


  //global context
  const { state: globalState, dispatch: globalStateDispatch } = useContext(
    store
  );
  console.log("glob", globalState);
  useEffect(() => {
    if (globalState.graph_nodes && globalState.graph_nodes.length !== 0)
      setNodes(globalState.graph_nodes);
  }, [])

  useEffect(() => {
    if (cardStatus == 0) {
      setClickedNode();
      setDetails();
    } else if (cardStatus == 1) {
      setDetails();
    } else if (cardStatus == 2) {
      setClickedNode();
    }
  }, [cardStatus]);

  const handleBgClick = color => {
    
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardTitle style={{margin:"5px"}}>
                <h1>Graph Visualisation</h1>
              </CardTitle>
              <CardBody>
                <div className={"drawerHeader"} />
                {
                  graphReady && <GraphWrapper data={graph} setCardStatus={setCardStatus} setClickedNode={setClickedNode} setShowCard={setShowCard} setDetails={setDetails} />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      <FixedPlugin
        bgColor={"white"}
        handleBgClick={handleBgClick}
        nodes = {nodes}
        setNodes = {setNodes}
        setGraph = {setGraph}
        setGraphReady = {setGraphReady}
      />
    </>
  );
}

