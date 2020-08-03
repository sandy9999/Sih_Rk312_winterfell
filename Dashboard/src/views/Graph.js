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
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Button,
  CardTitle
} from "reactstrap";
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import React, { useState, useEffect, useContext } from 'react';
import GraphWrapper from "./GraphWrappers/GraphWrapper"
import { store } from "../store";
import "./GraphWrappers/GraphWrapper.css"
import FixedPlugin from "../components/FixedPlugin/FixedPlugin.js";
import Axios from 'axios';
const config = require("../config");



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
  const [modal, setModal] = useState(false);
  const [edge, setEdge] = useState([]);
  const [notes, setNotes] = useState("");


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

  useEffect(() => {
    if (clickedNode != null) {
      setModal(true);
    }
    if (details != null) {
      setModal(true);
    }
  }, [clickedNode, details])

  const handleBgClick = color => {

  };

  const toggle = () => setModal(!modal);

  return (
    <>
      <div className="content">
        <Row>
          <Card style={{ maxHeight: "75vh" }}>
            <CardTitle style={{ margin: "5px" }}>
              <h1>Graph Visualisation</h1>
            </CardTitle>
            <CardBody>
              <div className={"drawerHeader"} />
              {
                graphReady && <GraphWrapper setEdge={setEdge} data={graph} setCardStatus={setCardStatus} setClickedNode={setClickedNode} setShowCard={setShowCard} setDetails={setDetails} />
              }
            </CardBody>
          </Card>
        </Row>
      </div>
      <FixedPlugin
        bgColor={"white"}
        handleBgClick={handleBgClick}
        nodes={nodes}
        setNodes={setNodes}
        setGraph={setGraph}
        setGraphReady={setGraphReady}
      />
      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>
          {clickedNode ? "Profile" : "Details"}
        </ModalHeader>
        <ModalBody>
          {
            clickedNode && Object.keys(clickedNode).map((key, index) => {
              if (clickedNode[key] != undefined) {
                return (
                  <Row>
                    <Col xs="6">{key}</Col>
                    <Col xs="6">{clickedNode[key]}</Col>
                  </Row>
                )
              }
            })
          }
          {
            (details && details[0]) && details[0].map((logItem, index) => {
              return (
                <Row>
                  <Col xs="6">{logItem["startTime"]}</Col>
                  <Col xs="6">{logItem["callType"]}</Col>
                </Row>
              )
            })
          }
          {
            (details && details[1][0]) && details[1][0]["notes"].map((notesItem, index) => {
              return (
                <Row>
                  <Col xs={6}>Details:</Col>
                  <Col xs={6}>{notesItem}</Col>
                </Row>
              )
            })
          }
          {
            details && <>
              <Input style={{color:"black"}} type="text" name="notes" id="notes" placeholder="Add a Note"
                onChange={(e) => setNotes(e.target.value)} />
              <Button onClick={async () => {
                try{
                  let data = await Axios.post(`${config.BASE_URL}/note/addNote`, { numbers: edge, note:notes });
                  toggle();
                }catch (err){
                  alert("Not Submitted");
                  console.log(err);
                }
                
              }}>Add</Button>
            </>
          }
        </ModalBody>
      </Modal>
    </>
  );
}

