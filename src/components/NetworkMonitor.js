import React, { useCallback, useEffect } from 'react'
import { useOcean } from '@oceanprotocol/react'
import { ConfigHelper } from '@oceanprotocol/lib'

export const NetworkMonitor = ({setConfig}) => {
    const { connect, web3Provider } = useOcean()

    const handleNetworkChanged = useCallback(
        (chainId) => {
            const config = new ConfigHelper().getConfig(chainId)
            connect(config)
            setConfig(config)
        },
        [connect]
    )

    useEffect(() => {
        if (!web3Provider) return

        web3Provider.on('chainChanged', handleNetworkChanged)

        return () => {
            web3Provider.removeListener('chainChanged', handleNetworkChanged)
        }
    }, [web3Provider, handleNetworkChanged])

    return <></>
}