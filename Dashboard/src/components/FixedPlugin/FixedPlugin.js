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
import React, { Component } from "react";

// reactstrap components
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { node } from "prop-types";
const config =  require('../../config')
const axios = require('axios').default;
const getGreenToRed = (percent) => {
  const r = 255 * percent/100;
  const g = 255 - (255 * percent/100);
  return 'rgb('+r+','+g+',0)';
}


class FixedPlugin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: "dropdown show-dropdown",
      nodes: this.props.nodes,
      newNode: "",
      duration: 0,
      count: 0
    };
  }
  handleClick = () => {
    if (this.state.classes === "dropdown show-dropdown") {
      this.setState({ classes: "dropdown show-dropdown show" });
    } else {
      this.setState({ classes: "dropdown show-dropdown" });
    }
  };

  activateMode = mode => {
    switch (mode) {
      case "light":
        document.body.classList.add("white-content");
        break;
      default:
        document.body.classList.remove("white-content");
        break;
    }
  };
  render() {
    return (
      <div className="fixed-plugin">
        <div className={this.state.classes}>
          <div onClick={this.handleClick}>
            <i className="fa fa-cog fa-2x" />
          </div>
          <ul className="dropdown-menu show">
            <li className="header-title">NODES</li>
            <li>
              {this.props.nodes.map((value, key) => {
                return <ListGroup key={key}>
                  <ListGroupItem>
                  <Button close onClick={(e) => {
                    this.props.setNodes(this.props.nodes.filter(node => node !== value))}}/>
                    
                    {value}
                  </ListGroupItem>
                </ListGroup>
              })}
            </li>
            <li style={{ width: "100%" }}>
              <FormGroup>
                <Input type="text" name="node" id="nodeInput" placeholder="addNode" onChange={(e) => this.setState({ newNode: e.target.value })} />
              </FormGroup>
            </li>
            <Button
              style={{ width: "100%" }}
              variant="contained"
              color="default"
              // startIcon={<PersonAdd />}
              onClick={() => {
                // just checking for 10 digit number
                const indianPhonePattern = RegExp("^([6-9]{1})([0-9]{9})$");
                if (indianPhonePattern.test(this.state.newNode)) {
                  this.props.setNodes(nodes => [...nodes, this.state.newNode]);
                }
                this.setState({ newNode: "" });
              }}
            >ADD NODE</Button>
            <li style={{ width: "100%" }}>
              <FormGroup>
                <Input type="text" name="node" id="nodeInput" placeholder="Enter Min Call Duration" onChange={(e) => this.setState({ duration: e.target.value })} />
                <Input type="text" name="node" id="nodeInput" placeholder="Enter Min Num of Calls" onChange={(e) => this.setState({ count: e.target.value })} />
              </FormGroup>
            </li>
            <li>
              <Button
                variant="contained"
                color="default"
                // startIcon={<Refresh />}
                onClick={() => {
                  axios.post(`${config.BASE_URL}/cdr/getAdjacency`, { "numbers": this.props.nodes })
                    .then(res => {
                      let message = res.data.message;
                      console.log(message);
                      // parse the response into graph form and set into state
                      let graph = { nodes: [], links: [] };
                      for (let nodeA in message) {
                        graph.nodes.push({ "id": nodeA });
                        for (let nodeB in message[nodeA]) {
                          // check if the nodeB is already there, else push
                          let duration = message[nodeA][nodeB].duration;
                          let numCalls = message[nodeA][nodeB].numCalls;
                          let sameIMEI = message[nodeA][nodeB].sameIMEI;
                          console.log(duration, this.state.duration)
                          if (duration >= this.state.duration && numCalls >= this.state.count) {
                            let currentNode = graph.nodes.filter(o => o["id"] === nodeB)
                            if (currentNode.length === 0) {
                              graph.nodes.push({ "id": nodeB })
                            }
                            //check if it's a same IMEI link
                            
                            if (sameIMEI) {
                              console.log("Asd");
                              graph.links.push({ "source": nodeA, "target": nodeB, color: "yellow", label: "same IMEI" });
                              // graph.links.push({"source": nodeB, "target": nodeA, color: "yellow"});
                              console.log("bye?", message[nodeB].nodeA);
                              delete message[nodeB].nodeA;
                              console.log("bye bye", message[nodeB].nodeA);
                            }
                            else {
                              console.log("Asd");
                              // alpha*duration + beta*numCalls = strength of relation
                              let alpha = 0.5;
                              let beta = 0.5;
                              let percent = (alpha * (duration / 106) + beta * (numCalls / 2)) * 100;
                              graph.links.push({ "source": nodeA, "target": nodeB, color: "white" });
                            }
                          }
                        }
                      }
                      console.log(graph)
                      this.props.setGraph(graph); this.props.setGraphReady(true);
                      this.handleClick()
                    })
                }}
              >
                Re-render graph
            </Button>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default FixedPlugin;
