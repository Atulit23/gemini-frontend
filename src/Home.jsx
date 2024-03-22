import React, { useEffect } from 'react'
import ChatBotMain from './ChatBotMain'
import './bot.css'
import Viewer from './Viewer'

export default function Home() {
    useEffect(() => {
        if(!localStorage.getItem("chatId")) {
            localStorage.setItem("chatId", Math.random().toString())
        }
    }, [])
    return (
        <main className='chat__main'>
            <Viewer />
            <ChatBotMain />
        </main>
    )
}
