import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import './IPDRCsvUpload.css';
import axios from 'axios';
const config = require('../../config')

function submitIPDRForm(contentType, data, setResponse) {
    axios.post(`${config.BASE_URL}/ipdr/uploadIPDRCSV`, data, {headers: {'content-type': contentType}})
    .then((response) => {
    setResponse(response.data);
    }).catch((error) => {
    setResponse("error");
    })
}


function IPDRCsvUpload() {
  const [file, setFile] = useState(null);

  function uploadIPDRWithFormData() {
    const formData = new FormData();
    formData.append("file", file);
    submitIPDRForm("multipart/form-data", formData, (msg) => console.log(msg))
  }

  return (
    <div className="IPDRCsvUpload">
        <p>Upload your IPDR data in the form of a CSV file here</p>

        <label htmlFor="upload-ipdr-data">
        <input
            style={{ display: 'none' }}
            id="upload-ipdr-data"
            name="upload-ipdr-data"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
        />
        <Fab
            color="secondary"
            size="small"
            component="span"
            aria-label="add"
            variant="extended"
        >
        <AddIcon /> Upload IPDR CSV file
        </Fab>
        </label>
        <Fab color="primary" size="small" component="span" aria-label="add" onClick={uploadIPDRWithFormData}>
        <AddIcon />
        </Fab>
    </div>
  );
}

export default IPDRCsvUpload;