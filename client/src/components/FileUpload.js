import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import CsvUpload from './CsvUpload/CsvUpload'
import ProfileCsvUpload from './ProfileCsvUpload/ProfileCsvUpload'

function FileUpload() {

  return (
    <div className="FileUpload">
        <CsvUpload/>
        <ProfileCsvUpload/>
    </div>
  );
}

export default FileUpload;