import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.css";
import FileUpload from "./components/FileUpload";
import LocationFilter from "./components/LocationFilter/LocationFilter";
import GraphViewScreen from "./components/Graph/GraphViewScreen";
import Navbar from "./components/NavBar";
import Map from "./components/Map/Map";
import { StateProvider } from "./components/Store/store";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Navbar /> */}
        <StateProvider>
          <Switch>
            <Route exact path="/" component={LocationFilter}></Route>
            <Route exact path="/map" component={Map}></Route>
            <Route exact path="/graph" component={GraphViewScreen}></Route>
            <Route exact path="/fileUploads" component={FileUpload}></Route>
          </Switch>
        </StateProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
