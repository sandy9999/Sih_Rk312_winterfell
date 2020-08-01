import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import './ProfileCsvUpload.css';
import axios from 'axios';
const config = require('../../config')

function submitProfileForm(contentType, data, setResponse) {
    axios.post(`${config.BASE_URL}/cdr/uploadProfileCSV`, data, {headers: {'content-type': contentType}})
    .then((response) => {
    setResponse(response.data);
    }).catch((error) => {
    setResponse("error");
    })
}


function ProfileCsvUpload() {
  const [file, setFile] = useState(null);

  function uploadProfileWithFormData() {
    const formData = new FormData();
    formData.append("file", file);
    submitProfileForm("multipart/form-data", formData, (msg) => console.log(msg))
  }

  return (
    <div className="ProfileCsvUpload">
        <p>Upload your Profile data in the form of a CSV file here</p>

        <label htmlFor="upload-profile-data">
        <input
            style={{ display: 'none' }}
            id="upload-profile-data"
            name="upload-profile-data"
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
        <AddIcon /> Upload Profile CSV file
        </Fab>
        <br />
        <br />
        </label>
        <Fab color="primary" size="small" component="span" aria-label="add" onClick={uploadProfileWithFormData}>
        <AddIcon />
        </Fab>
    </div>
  );
}

export default ProfileCsvUpload;