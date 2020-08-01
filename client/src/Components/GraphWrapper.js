import { Component} from 'react';
import React from 'react';
import { Graph } from "react-d3-graph";
 


export default class GraphWrapper extends Component {

myConfig = {
    "automaticRearrangeAfterDropNode": true,
    "collapsible": true,
    "directed": true,
    "nodeHighlightBehavior": true,
    "linkHighlightBehavior": true,
    "node": {
        "color": "purple",
        "fontColor": "black",
        "highlightColor": "#ab00ff",
        },
    "link": {
        "color": "black",
        "fontColor": "black",
        }
}

// graph event callbacks1
onClickGraph = function() {
    // window.alert(`Clicked the graph background`);
};
 
onClickNode = function(nodeId) {
    // window.alert(`Clicked node ${nodeId}`);
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
 
onClickLink = function(source, target) {
    // window.alert(`Clicked link between ${source} and ${target}`);
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