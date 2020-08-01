import React, { useState } from 'react';
import './LocationFilter.css';
const config = require('../../config')

function handleSubmit(event)
{
    event.preventDefault();
    fetch(config.BASE_URL + '/cdr/getLatLong', {
        method: 'POST',
        body: JSON.stringify({ data: event.target.Location.value }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function LocationFilter() {

  return (
    <div className="LocationFilter">
      <form onSubmit={handleSubmit} className="LocationFilter">

      <label>Location</label>
      <input
        type="text"
        name="Location"
      />
      <br />
      <button type="submit">Submit</button>
    </form>
    </div>
  );
}

export default LocationFilter;