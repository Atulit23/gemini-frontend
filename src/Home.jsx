import React from 'react'
import ChatBotMain from './ChatBotMain'
import './bot.css'
import Viewer from './Viewer'

export default function Home() {
    return (
        <main className='chat__main'>
            <Viewer />
            <ChatBotMain />
        </main>
    )
}
