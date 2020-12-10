import React from 'react'
import './Spinner.css'

const spinner = (props) => {
    return (
        <div className="Loader">{props.text ? props.text : "Loading..."}</div>
    )
}

export default spinner;