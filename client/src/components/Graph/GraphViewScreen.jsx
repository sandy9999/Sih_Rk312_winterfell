import React, { useState, useEffect, useContext } from 'react';
import { store } from "../Store/store";
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PersonAdd from '@material-ui/icons/PersonAdd';
import Refresh from '@material-ui/icons/Refresh'
import {Button} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import axios from 'axios';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import GraphWrapper from "./GraphWrapper";
const config = require('../../config')


// styles for the navbar
const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  visible: {
    visibility: 'visible',
    width: '25vw !important',
    position: 'absolute',
    right: 0,
    padding:'5px'
  },
  hidden:{
    visibility: 'hidden',
  },
  cardClose:{
    position:"absolute",
    right: "0",
    top: "15px"
  },
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  addNumber: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
  list: {
    width: '100%',
    maxWidth: 360,
    position: 'relative',
    overflow: 'auto',
    maxHeight: 300,
  }
}));
//helper to get RGB when given percentage from green -> red
const getGreenToRed = (percent) => {
  const r = 255 * percent/100;
  const g = 255 - (255 * percent/100);
  return 'rgb('+r+','+g+',0)';
}

export default function GraphViewScreen() {
  // state to store node numbers
  const [graph, setGraph] = useState({nodes:[], links:[]});
  // state to filter call duration, number of calls
  const [callDuration, setCallDuration] = useState(0);
  const [numberOfCalls, setNumberOfCalls] = useState(0);
  
  const [graphReady, setGraphReady] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState();
  const classes = useStyles();
  const theme = useTheme();
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
  useEffect(()=>{
    if(globalState.graph_nodes && globalState.graph_nodes.length !== 0)
    setNodes(globalState.graph_nodes);
  },[])

  useEffect(()=>{
    if(cardStatus==0){
      setClickedNode();
      setDetails();
    } else if(cardStatus==1){
      setDetails();
    } else if(cardStatus==2){
      setClickedNode();
    }
  },[cardStatus]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Graph Visualization
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
         {/* List the current nodes in state */}
        <List className={classes.list}>
        {nodes.map((value, key) => {
          return <ListItem key={key}>
            <ListItemText>
              <IconButton onClick={(e) => {
                setNodes(nodes.filter(node => node !== value))}
                }>
                <DeleteIcon />
              </IconButton>
              {value}
            </ListItemText>
          </ListItem>
        })}
        </List>
        <Divider />
        {/* Buttons to add new number, rerender graph */}
        <div className={classes.addNumber}>
          <TextField
            id="standard-basic"
            value={newPhoneNumber}
            label="Enter Number"
            onChange={(e) => setNewPhoneNumber(e.target.value)}
          />
          <Button
            variant="contained"
            color="default"
            className={classes.button}
            startIcon={<PersonAdd />}
            onClick = {() => {
              // just checking for 10 digit number
              const indianPhonePattern = RegExp("^([6-9]{1})([0-9]{9})$");
              if(indianPhonePattern.test(newPhoneNumber)) {
                setNodes(nodes => [...nodes, newPhoneNumber]);
              }
              setNewPhoneNumber("");
            }}
          >
          Add another number
          </Button>
          <TextField 
            id="standard-basic" 
            value={callDuration} 
            label="Enter Min Call Duration"   
            onChange={(e) => setCallDuration(e.target.value)}
          />
          <TextField 
            id="standard-basic" 
            value={numberOfCalls} 
            label="Enter Min Num of calls"   
            onChange={(e) => setNumberOfCalls(e.target.value)}
          />
          <Button 
            variant="contained"
            color="default"
            className={classes.button}
            startIcon={<Refresh />}
            onClick = {() => {
              axios.post(`${config.BASE_URL}/cdr/getAdjacency`, { "numbers": nodes})
              .then(res => {
                let message = res.data.message;
                console.log(message);
                // parse the response into graph form and set into state
                let graph = {nodes: [], links: []};
                for (let nodeA in message) {
                  graph.nodes.push({"id": nodeA});
                  for(let nodeB in message[nodeA]){
                    // check if the nodeB is already there, else push
                    let duration = message[nodeA][nodeB].duration;
                    let numCalls = message[nodeA][nodeB].numCalls;
                    let sameIMEI = message[nodeA][nodeB].sameIMEI;
                    if( duration >= callDuration && numCalls >= numberOfCalls){                    
                      let currentNode = graph.nodes.filter(o => o["id"] === nodeB)
                      if(currentNode.length === 0){
                        graph.nodes.push({"id":nodeB})
                      }
                      //check if it's a same IMEI link
                      if(sameIMEI){
                        graph.links.push({"source": nodeA, "target": nodeB, color: "yellow", label:"same IMEI"});
                        // graph.links.push({"source": nodeB, "target": nodeA, color: "yellow"});
                        console.log("bye?", message[nodeB].nodeA);
                        delete message[nodeB].nodeA;
                        console.log("bye bye",message[nodeB].nodeA);
                        }
                      else{
                      // alpha*duration + beta*numCalls = strength of relation
                      let alpha = 0.5;
                      let beta = 0.5;
                      let percent = (alpha*(duration/106) + beta*(numCalls/2))*100;
                      graph.links.push({"source": nodeA, "target": nodeB, color: getGreenToRed(percent)});
                      }
                    }
                  }
                }
                setGraph(graph);setGraphReady(true);
              })
            }}
          >
            Re-render graph
            </Button>
        </div>
      </Drawer>

      <Card className={classes.root, classes.profileCard,  
        showCard?classes.visible:classes.hidden} variant="outlined" elevation="5">
      <CardContent>
      <Grid container spacing={12}>
          <Grid item xs={12}><h4>
            {clickedNode ? "Profile" : "Details"}
          </h4></Grid>
          {
            clickedNode && Object.keys(clickedNode).map((key, index) => {
              return (
                <Grid container spacing={12}>
                <Grid item xs={6}>{key}:</Grid>
                <Grid item xs={6}>{clickedNode.length!=0? clickedNode[key] : 0}</Grid>
                </Grid>
              )
            })
          }
          {
            (details && details[0]) && details[0].map((logItem, index) => {
              return (
                <Grid container spacing={12}>
                <Grid item xs={6}>{logItem["startTime"]}</Grid>
                <Grid item xs={6}>{logItem["callType"]}</Grid>
                </Grid>
              )
            })
          }
          {
            (details && details[1]) && details[1].map((notesItem, index) => {
              return (
                <Grid container spacing={12}>
                <Grid item xs={6}>{details}:</Grid>
                <Grid item xs={6}>{notesItem["notes"]}</Grid>
                </Grid>
              )
            })
          }
          

        </Grid>
      </CardContent>
      <CardActions>
        <Button size="small" className={classes.cardClose} onClick={()=>setShowCard(false)}><CloseIcon/></Button>
      </CardActions>
      </Card>

      
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {
          graphReady && <GraphWrapper data={graph} setCardStatus={setCardStatus} setClickedNode={setClickedNode} setShowCard={setShowCard} setDetails={setDetails}/>
        }
      </main>
    </div>
  );
}
