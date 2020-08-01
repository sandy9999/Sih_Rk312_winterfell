import { Component} from 'react';
import React from 'react';
import { Graph } from "react-d3-graph";
import Axios from 'axios';
import './GraphWrapper.css'
const config = require('../../config')

 


export default class GraphWrapper extends Component {
    // myConfig = {
    //     "automaticRearrangeAfterDropNode": true,
    //     "collapsible": true,
    //     "directed": true,
    //     "nodeHighlightBehavior": true,
    //     "linkHighlightBehavior": true,
    //     "node": {
    //         "color": "purple",
    //         "fontColor": "black",
    //         "highlightColor": "#ab00ff",
    //         },
    //     "link": {
    //         "color": "black",
    //         "fontColor": "black",
    //         }
    // }
    myConfig = {
    "automaticRearrangeAfterDropNode": true,
    "collapsible": true,
    "directed": true,
    "focusAnimationDuration": 0.75,
    "focusZoom": 1,
    "height": 400,
    "highlightDegree": 2,
    "highlightOpacity": 0.2,
    "linkHighlightBehavior": true,
    "maxZoom": 12,
    "minZoom": 0.05,
    "nodeHighlightBehavior": true,
    "panAndZoom": false,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    "width": 800,
    "d3": {
        "alphaTarget": 0.05,
        "gravity": -250,
        "linkLength": 120,
        "linkStrength": 2,
        "disableLinkForce": false
    },
    "node": {
        "color": "purple",
        "fontColor": "black",
        "fontSize": 10,
        "fontWeight": "normal",
        "highlightColor": "red",
        "highlightFontSize": 14,
        "highlightFontWeight": "bold",
        "highlightStrokeColor": "red",
        "highlightStrokeWidth": 1.5,
        "mouseCursor": "crosshair",
        "opacity": 0.9,
        "renderLabel": true,
        "size": 200,
        "strokeColor": "none",
        "strokeWidth": 1.5,
        "svg": "",
        "symbolType": "circle"
    },
    "link": {
        "color": "lightgray",
        "fontColor": "black",
        "fontSize": 8,
        "fontWeight": "normal",
        "highlightColor": "blue",
        "highlightFontSize": 8,
        "highlightFontWeight": "normal",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "semanticStrokeWidth": true,
        "strokeWidth": 3,
        "markerHeight": 6,
        "markerWidth": 6
    }
}

// graph event callbacks1
onClickGraph = function() {
    // window.alert(`Clicked the graph background`);
};
 
onClickNode = async (nodeId) => {
    try {
    let data = await Axios.post(config.BASE_URL+"/profile/getProfile",{"phoneNumber":nodeId});
    this.props.setClickedNode(data.data.message[0]);
    this.props.setShowCard(true);
    this.props.setCardStatus(1);
    } catch(e){
        console.log(e);
    }

};
 
onDoubleClickNode = function(nodeId) {
    // window.alert(`Double clicked node ${nodeId}`);
};
 
onRightClickNode = function(event, nodeId) {
    // window.alert(`Right clicked node ${nodeId}`);
};
 
onMouseOverNode = function(nodeId) {
    // window.alert(`Mouse over node ${nodeId}`);
};
 
onMouseOutNode = function(nodeId) {
    // window.alert(`Mouse out node ${nodeId}`);
};
 
onClickLink = async (source, target) => {
    // window.alert(`Clicked link between ${source} and ${target}`);
    try {
        let data = await Axios.post(config.BASE_URL+"/cdr/getLogs",{"numbers":[source,target]});
        this.props.setDetails([data.data.logs,data.data.notes]);
        this.props.setShowCard(true);
        this.props.setCardStatus(2);
        } catch(e){
            console.log(e);
        }
};
 
onRightClickLink = function(event, source, target) {
    // window.alert(`Right clicked link between ${source} and ${target}`);
};
 
onMouseOverLink = function(source, target) {
    // window.alert(`Mouse over in link between ${source} and ${target}`);
};
 
onMouseOutLink = function(source, target) {
    // window.alert(`Mouse out link between ${source} and ${target}`);
};
 
onNodePositionChange = function(nodeId, x, y) {
    // window.alert(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
};

render(){
    return <Graph 
    id="graph" // id is mandatory, if no id is defined rd3g will throw an error
    data={this.props.data}
    config={this.myConfig}
    onClickNode={this.onClickNode}
    onDoubleClickNode={this.onDoubleClickNode}
    onRightClickNode={this.onRightClickNode}
    onClickGraph={this.onClickGraph}
    onClickLink={this.onClickLink}
    onRightClickLink={this.onRightClickLink}
    onMouseOverNode={this.onMouseOverNode}
    onMouseOutNode={this.onMouseOutNode}
    onMouseOverLink={this.onMouseOverLink}
    onMouseOutLink={this.onMouseOutLink}
    onNodePositionChange={this.onNodePositionChange}
    />;
}

}