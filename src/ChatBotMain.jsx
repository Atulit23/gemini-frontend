import React, { useEffect, useState } from 'react'
import send from './send.svg'
import Typewriter from './Typewriter'
import axios from 'axios'
import { uuid } from 'uuidv4';
import { io } from 'socket.io-client';

export default function ChatBotMain() {
    const [allChats, setAllChats] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState("")
    const chatId = Math.random().toString()

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer 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",
    };

    async function getSingleChat() {
        await axios.get(`https://gemini-backend-beta.vercel.app/get-single-chat?chatId=${localStorage.getItem("chatId")}`).then(res => {
            console.log(res.data)
            if (res.data[0]?.chats) {
                setAllChats(res.data[0]?.chats)
            }
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        getSingleChat()
    }, [localStorage.getItem("chatId")])

    async function query(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        console.log(response)
        const result = await response.json();
        console.log(result)
        return result;
    }

    async function addChat(data) {
        let arr = []
        data.map((item) => {
            arr.push({ question: item?.question, answer: item?.answer })
        })
        console.log(arr)
        await axios.post('https://gemini-backend-beta.vercel.app/add-chat', {
            userId: localStorage.getItem("loginId"),
            chatId: localStorage.getItem("chatId"),
            chats: arr
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        const socket = io('https://gemini-chat-socket.onrender.com');
        socket.on('connect', () => console.log(socket.id));

        socket.on('connect_error', () => {
            setTimeout(() => socket.connect(), 5000);
        });

        socket.on('disconnect', () => console.log('server disconnected'));
        socket.on('response', (data) => {
            console.log(data)
            let arr1 = [...allChats]
            if (arr1[arr1?.length - 1]) {
                arr1[arr1?.length - 1].answer = arr1[arr1?.length - 1].answer + data?.replaceAll("\n\n", "\n")?.replaceAll("**", "")?.replaceAll("*", "• ")
                setAllChats(arr1)
                addChat(arr1)

            } else {
                arr1[arr1?.length - 1].answer = ""
            }
        });

        if (document.getElementById("srcollables")) {
            var scrollables = document.getElementById("srcollables");
            document.getElementById("srcollables").scrollTo({
                top: scrollables.scrollHeight,
                behavior: 'smooth'
            });
        }

        return () => {
            socket.disconnect();
        };


    }, [allChats]);


    async function handleQuery(arr, inputs, arrToSend) {
        // await axios.post(`https://gemini-backend-beta.vercel.app/generate`, {
        //     prompt: inputs,
        //     history: arrToSend
        // })
        //     // await axios
        //     //     .post(
        //     //         "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
        //     //         {
        //     //             inputs: inputs,
        //     //         },
        //     //         { headers: headers }
        //     //     )
        //     .then((response_) => {
        //         let arr1 = [...arr]
        //         console.log(arr1)
        //         console.log(arr1[arr1?.length - 1])
        //         if (arr1[arr1?.length - 1]) {
        //             arr1[arr1?.length - 1].answer = ""
        //             arr1[arr1?.length - 1].answer = response_.data.gen_response?.replaceAll("\n\n", "\n")?.replaceAll("**", "")?.replaceAll("*", "• ")
        //             setAllChats(arr1)
        //             addChat(arr1)
        //         }
        //         console.log(arr1)
        //         console.log(response_?.data[0]?.generated_text)
        //     })
        //     .catch((error) => {
        //         console.error("Error:", error);
        //     });
        const room = Math.random().toString()
        io('https://gemini-chat-socket.onrender.com').emit('joinRoom', room);
        io('https://gemini-chat-socket.onrender.com').emit('message', { text: inputs, array: arrToSend, room: room });
    }

    console.log(allChats)

    return (
        <div className='where__we__chat'>
            <div className="all__main__chats" id="srcollables">
                {
                    allChats?.map((item, index) => {
                        return (
                            <div className="main_thing">
                                <span className='Question'>{item.question}</span>
                                <div className="Answer">
                                    <img src="https://huggingface.co/avatars/2edb18bd0206c16b433841a47f53fa8e.svg" alt="" />
                                    <div className="inside__answer">
                                        {item?.before === false ?
                                            <Typewriter text={item?.answer ? item?.answer : ''} delay={20} />
                                            :
                                            item?.answer ? item?.answer.split("\n").map((part, index) => (
                                                <span key={index}>
                                                    {part}
                                                    {index < item?.answer.split("\n")?.length - 1 && (
                                                        <>
                                                            <br />
                                                            <br />
                                                        </>
                                                    )}
                                                </span>
                                            )) : ''
                                        }
                                        {/* {
                                            item?.answer && item?.answer.split("\n").map((part, index) => (
                                                <span key={index}>
                                                    {part}
                                                    {index < item?.answer.split("\n")?.length - 1 && (
                                                        <>
                                                            <br />
                                                            <br />
                                                        </>
                                                    )}
                                                </span>
                                            ))
                                        } */}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="chat__input">
                <input type="text" placeholder='Ask Anything' value={currentQuestion} onChange={(e) => {
                    setCurrentQuestion(e.target.value)
                }} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (currentQuestion !== "") {
                            let arr = [...allChats]
                            arr.push({ question: currentQuestion, answer: " ", before: false })
                            setAllChats(arr)
                            setCurrentQuestion("")
                            handleQuery(arr, "" + currentQuestion, allChats)
                        }
                    }
                }} />
                <img src={send} alt="" />
            </div>
        </div>
    )
}