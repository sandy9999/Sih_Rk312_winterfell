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
const axios = require("axios")  
const config = require("../config.js")

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

  const getGreenToRed = (percent) => {
    const r = 255 * percent/100;
    const g = 255 - (255 * percent/100);
    return 'rgb('+r+','+g+',0)';
  }

  //global context
  const { state: globalState, dispatch: globalStateDispatch } = useContext(
    store
  );
  useEffect(() => {
    if (globalState.graph_nodes && globalState.graph_nodes.length !== 0)
      setNodes(globalState.graph_nodes);

      axios.post(`${config.BASE_URL}/cdr/getAdjacency`, { "numbers": nodes })
      .then(res => {
        let message = res.data.message;
        // parse the response into graph form and set into state
        let graph = { nodes: [], links: [] };
        for (let nodeA in message) {
          graph.nodes.push({ "id": nodeA });
          for (let nodeB in message[nodeA]) {
            // check if the nodeB is already there, else push
            let duration = message[nodeA][nodeB].duration;
            let numCalls = message[nodeA][nodeB].numCalls;
            let sameIMEI = message[nodeA][nodeB].sameIMEI;
            if (duration >= 0 && numCalls >= 0) {
              let currentNode = graph.nodes.filter(o => o["id"] === nodeB)
              if (currentNode.length === 0) {
                graph.nodes.push({ "id": nodeB })
              }
              //check if it's a same IMEI link
              
              if (sameIMEI) {
                graph.links.push({ "source": nodeA, "target": nodeB, color: "yellow", label: "same IMEI" });
                // graph.links.push({"source": nodeB, "target": nodeA, color: "yellow"});
                delete message[nodeB].nodeA;
              }
              else {
                // alpha*duration + beta*numCalls = strength of relation
                let alpha = 0.5;
                let beta = 0.5;
                let percent = (alpha * (duration / 106) + beta * (numCalls / 2)) * 100;
                graph.links.push({"source": nodeA, "target": nodeB, color: getGreenToRed(percent)});
              }
            }
          }
        }
        setGraph(graph); setGraphReady(true);
      })
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

