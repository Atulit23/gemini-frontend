import React, { useEffect, useState } from 'react'
import './bot.css'
import axios from 'axios'
import dp from '../src/assets/images/unnamed.jpg'

export default function Viewer() {
    const [data, setData] = useState([])
    const [currIndex, setCurrIndex] = useState(0)

    async function getAllUserChats() {
        await axios.get(`https://agribot-main.onrender.com/get-chats?userId=${localStorage.getItem("loginId")}`).then(res => {
            setData(res.data.reverse())
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        getAllUserChats()
    }, [])

    return (
        <div className='viewer__main'>
            <div className="top__header">
                <div>
                    <img src="https://huggingface.co/chat/huggingchat/logo.svg" alt="" />
                    <span>AgroChat</span>
                </div>
                <button className='new__chat' onClick={() => {
                    localStorage.setItem("chatId", Math.random().toString())
                    localStorage.setItem("currIndex", '')
                    window.location.reload()
                }}>New Chat</button>
            </div>
            <div className="all__chats">
                {
                    data?.map((item, index) => {
                        return (
                            <div className={localStorage.getItem("currIndex") === index.toString() ? "current__chat__bg" : "current__chat__no__bg"} key={index} onClick={() => {
                                localStorage.setItem("chatId", item?.chatId)
                                localStorage.setItem("currIndex", index.toString())
                                window.location.reload()
                            }}>
                                <span>{item?.chats[0]?.question[0]?.toUpperCase()}{item?.chats[0]?.question?.substring(1, 25)}{item?.chats[0]?.question?.length > 25 && "..."}</span>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
