import React, { useCallback } from 'react'
import { useOcean } from '@oceanprotocol/react'
import { useEffect } from 'react'
import { NetworkMonitor } from './NetworkMonitor'

export default function Wallet({ divStyle, btnStyle, textStyle }) {
    const { ocean, connect, logout, accountId } = useOcean()

    const conn = async () => {
        await connect()
    }

    const init = useCallback(async () => {
        if (ocean === undefined || accountId === undefined) return
        await ocean.assets.ownerAssets(accountId)
    }, [accountId, ocean])

    useEffect(() => {
        init()
    }, [ocean, accountId, init])

    const disc = async () => {
        await logout()
        await conn()
    }

    return (
        <div style={divStyle}>
            <NetworkMonitor />
            {
                accountId ?
                    <p style={textStyle}>{accountId}</p> :
                    <button style={btnStyle} onClick={conn}>Connect</button>

            }
        </div >
    )
}

Wallet.defaultProps = {
    textStyle: {
        padding: "10px",
        color: "#0202022",
        fontWeight: 600,
        background: "#bbbbbb"


    },
    btnStyle: {
        border: '1px solid #d2d2d2',
        padding: '0.5rem',
        borderRadius: '10% 10%'

    },
    divStyle: {
        float: 'right',
        margin: '20px',
    }

}