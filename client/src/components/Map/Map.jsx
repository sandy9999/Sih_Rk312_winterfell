import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { store } from "../Store/store";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import MenuIcon from "@material-ui/icons/Menu";
import DeleteIcon from "@material-ui/icons/Delete";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Search from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CircularProgress from "@material-ui/core/CircularProgress";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
const config = require("../../config");

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      height: "7vh",
      // maxHeight: "10vh",
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: { ...theme.mixins.toolbar, height: "7vh" },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    height: "100vh",
    // padding: theme.spacing(3),
  },
  margin: {
    margin: theme.spacing(1),
  },
  timePicker: {
    margin: "20px 5px",
    width: "90%",
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  loader: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    position: "fixed",
    top: `10px`,
    left: `10px`,
    zIndex: "1200",
  },
}));

function Map(props) {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { state: globalState, dispatch: globalStateDispatch } = useContext(
    store
  );
  const history = useHistory();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDate, handleDateChange] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchLocations, setSearchLocations] = useState([]);
  const [userMarkers, setUserMarkers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(0);
  const [targetList, setTargetList] = useState([]);

  const [areaRadius, setAreaRadius] = useState(1);
  const [timeOffset, setTimeOffset] = useState(30);

  const [viewPort, setViewPort] = useState({
    latitude: 13.007568,
    longitude: 80.25777,
    zoom: 12,
    width: "100%",
    height: "93vh",
  });

  useEffect(() => {
    const listener = (e) => {
      if (e.key == "Escape") {
        setModalOpen(false);
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLocationSearch = async (loc) => {
    if (typingTimeout > 0) {
      clearTimeout(typingTimeout);
    }

    if (loc.length > 0) setIsLoading(true);

    setTypingTimeout(
      setTimeout(async () => {
        if (loc.length) {
          const res = await fetch(`${config.BASE_URL}/cdr/getLocationsList`, {
            method: "POST",
            body: JSON.stringify({ data: loc }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          let list = await res.json();
          setSearchLocations((locs) => list.message);
          setModalOpen(true);
        }
        setIsLoading(false);
      }, 2000)
    );
  };

  const handleSearchLocationSet = async (loc) => {
    setModalOpen(false);
    setIsLoading(true);
    const res = await fetch(`${config.BASE_URL}/cdr/getLatLong`, {
      method: "POST",
      body: JSON.stringify({ data: loc }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let locData = await res.json();
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

  const handleUsersQuery = async (e) => {
    setIsLoading(true);
    setUserMarkers([]);
    const payload = {
      refTime: selectedDate,
      duration: timeOffset,
      location: { lat: viewPort.latitude, long: viewPort.longitude },
      radius: areaRadius,
    };

    const res = await fetch(`${config.BASE_URL}/cdr/getRecords`, {
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

  const handleGoToGraph = (e) => {
    globalStateDispatch({ type: "SET_GRAPH_NODES", payload: targetList });
    history.push("/graph");
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <div className={classes.margin}>
          <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
              <TextField
                id="input-with-icon-grid"
                label="Search Location"
                // value={searchLocation}
                onChange={(e) => {
                  handleLocationSearch(e.target.value);
                }}
              />
            </Grid>
            <Grid item>
              <Search />
            </Grid>
          </Grid>
        </div>
      </List>
      <Divider />
      <ListItem>
        <Typography>Radius (kms)</Typography>
        <Slider
          className={classes.margin}
          style={{ width: "90%" }}
          value={areaRadius}
          step={1}
          min={1}
          max={20}
          valueLabelDisplay="auto"
          onChange={(e, newVal) => {
            setAreaRadius(newVal);
          }}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <Typography>Date & Time</Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DateTimePicker
            value={selectedDate}
            className={classes.timePicker}
            // disableFuture
            onChange={handleDateChange}
            showTodayButton
          />
        </MuiPickersUtilsProvider>
      </ListItem>
      <Divider />
      <ListItem>
        <TextField
          label="Time offset range (mins)"
          type="Number"
          value={timeOffset}
          onChange={(e) => setTimeOffset(parseInt(e.target.value))}
        />
      </ListItem>
      <Divider />
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "30px", marginBottom: "30px" }}
        onClick={handleUsersQuery}
      >
        Submit Query
      </Button>
      <Divider />
      <Typography>Target Users</Typography>
      {targetList.length ? (
        <List>
          {targetList.map((ele, idx) => {
            return (
              <>
                <ListItem button key={idx}>
                  <ListItemIcon>
                    <DeleteIcon
                      onClick={() => {
                        handleTargetUserDelete(ele);
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText>{ele}</ListItemText>
                </ListItem>
              </>
            );
          })}
        </List>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        disabled={targetList.length == 0}
        onClick={handleGoToGraph}
      >
        Go to graph
      </Button>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Map
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
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

          {userMarkers.length &&
            userMarkers.map((ele, idx) => (
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
                  <img src="/userPinN.png" height="40px" width="40px" />
                </button>
              </Marker>
            ))}
          {selectedUser && (
            <Popup
              latitude={parseFloat(selectedUser.destLatLong.lat)}
              longitude={parseFloat(selectedUser.destLatLong.long)}
              closeOnClick={false}
              onClose={(e) => {
                setSelectedUser(null);
              }}
            >
              <pre>{JSON.stringify(selectedUser, null, 2)}</pre>
              {console.log(
                targetList.findIndex((ele) => {
                  return ele == selectedUser["callerNumber"];
                }) != -1,
                "Ooj"
              )}
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
        </ReactMapGL>
        {searchLocations.length && modalOpen && (
          <div
            style={{
              top: `50%`,
              left: `50%`,
              transform: `translate(-50%, -50%)`,
            }}
            className={classes.paper}
          >
            {searchLocations.map((ele, idx) => {
              return (
                <ListItem
                  button
                  key={idx}
                  onClick={(e) => handleSearchLocationSet(ele)}
                >
                  <ListItemText primary={ele} />
                </ListItem>
              );
            })}
          </div>
        )}
        {isLoading && (
          <div className={classes.loader}>
            <CircularProgress color="primary" />
          </div>
        )}
      </main>
    </div>
  );
}

Map.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Map;
