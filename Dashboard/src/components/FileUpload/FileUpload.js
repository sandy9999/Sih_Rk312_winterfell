import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import CloudUpload from '@material-ui/icons/CloudUpload'
import './FileUpload.css';
import axios from 'axios';
const config = require('../../config')

function submitForm(data, apiEndPoint, setResponse) {
    const url = `${config.BASE_URL}` + apiEndPoint;
    axios.post(url, data, {headers: {'content-type': "multipart/form-data"}})
    .then((response) => {
    setResponse(response.data);
    }).catch((error) => {
    setResponse("error");
    })
}


function FileUpload(props) {
  // super(props);
  const [file, setFile] = useState(null);

  function uploadWithFormData() {
    const formData = new FormData();
    formData.append("file", file);
    submitForm(formData, props.apiEndPoint, (msg) => console.log(msg))
  }

  return (
    <div className="fileUpload">
        <p>Upload your {props.name} data file here</p>
        <label htmlFor="upload-data">
        <input
            style={{ display: 'none' }}
            id="upload-data"
            name="upload-data"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
        />
        <Fab
            color="primary"
            size="small"
            component="span"
            aria-label="add"
            variant="extended"
        >
        <AddIcon /> Upload {props.name} file
        </Fab>
        </label>
        <br />
        <Fab color="primary" size="small" component="span" aria-label="add" onClick={uploadWithFormData}>
        <CloudUpload />
        </Fab>
        <span className="uploadedFile"> 
        {file &&  file.name}
        </span>
    </div>
  );
}

export default FileUpload;