import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import './CsvUpload.css';
import axios from 'axios';
const config = require('../../config')

function submitForm(contentType, data, setResponse) {
    axios.post(`${config.BASE_URL}/cdr/uploadCSV`, data, {headers: {'content-type': contentType}})
    .then((response) => {
    setResponse(response.data);
    }).catch((error) => {
    setResponse("error");
    })
}


function CsvUpload() {
  const [file, setFile] = useState(null);

  function uploadWithFormData() {
    const formData = new FormData();
    formData.append("file", file);
    submitForm("multipart/form-data", formData, (msg) => console.log(msg))
  }

  return (
    <div className="CsvUpload">
        <p>Upload your CDR data in the form of a CSV file here</p>
        <label htmlFor="upload-data">
        <input
            style={{ display: 'none' }}
            id="upload-data"
            name="upload-data"
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
        <AddIcon /> Upload CDR CSV file
        </Fab>
        </label>
        <Fab color="primary" size="small" component="span" aria-label="add" onClick={uploadWithFormData}>
        <AddIcon />
        </Fab>
    </div>
  );
}

export default CsvUpload;