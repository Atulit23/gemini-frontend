import React, { useEffect, useRef, useState } from 'react'
import send from './send.svg'
import Typewriter from './Typewriter'
import axios from 'axios'
import { uuid } from 'uuidv4';
import { io } from 'socket.io-client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import paper from '../src/assets/images/paper.png'
import mic from '../src/assets/images/mic.png'
import upload from '../src/assets/images/upload.png'
import { createClient } from '@deepgram/sdk';

export default function ChatBotMain() {
    const [allChats, setAllChats] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState("")
    const chatId = Math.random().toString()
    const audioInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [jobId, setJobId] = useState('');
    const [audioURL, setAudioURL] = useState('');

    const handleImageClick = () => {
        imageInputRef.current.click();
    };

    // Start speech recognition
    const [text, setText] = useState('');
    const mediaRecorder = useRef(null);
    const recognition = useRef(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.start();

            const audioChunks = [];
            mediaRecorder.current.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.current.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                setAudioBlob(audioBlob);
                console.log('Audio recording completed');
            });

            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            console.log('Media recorder stopped');
        }
        setIsRecording(false);
    };

    
const transcribeAudio = async (audioBlob) => {
    const deepgramApiKey = 'de10d40c71916b9b72f24b8bcdf77be587f26eb4';
    const deepgram = createClient(deepgramApiKey);
  
    // Convert the blob to an ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
  
    try {
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        arrayBuffer,
        {
          mimetype: audioBlob.type, // This should be 'audio/wav' based on your previous code
          model: 'nova-2',
          language: 'en',
          smart_format: true,
        }
      );
  
      if (error) {
        console.error('Transcription error:', error);
        return null;
      } else {
        console.dir(result, { depth: null });
        // Assuming the transcript is in result.results.channels[0].alternatives[0].transcript
        return result.results.channels[0].alternatives[0].transcript;
      }
    } catch (err) {
      console.error('Error during transcription:', err);
      return null;
    }
  };
  
  const performSpeechToText = async () => {
    if (!audioBlob) {
      console.log('No audio recorded yet');
      return;
    }
  
    try {
      const transcript = await transcribeAudio(audioBlob);
      if (transcript) {
        setText(transcript);
      } else {
        console.log('No transcription returned');
      }
    } catch (error) {
      console.error('Error during transcription:', error);
    } finally {
    }
  };
    const handleImageChange = (event) => {
        const imageFile = event.target.files[0];
        if (imageFile) {
            console.log('Image file uploaded:', imageFile);
        }
    };
    
    useEffect(() => {
        performSpeechToText()
    }, [audioBlob, audioURL])

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer APIKEY",
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

    // useEffect(() => {
    //     const socket = io('https://gemini-chat-socket.onrender.com');
    //     socket.on('connect', () => console.log(socket.id));

    //     socket.on('connect_error', () => {
    //         setTimeout(() => socket.connect(), 5000);
    //     });

    //     socket.on('disconnect', () => console.log('server disconnected'));
    //     socket.on('response', (data) => {
    //         console.log(data)
    //         let arr1 = [...allChats]
    //         if (arr1[arr1?.length - 1]) {
    //             arr1[arr1?.length - 1].answer = arr1[arr1?.length - 1].answer + data?.replaceAll("\n\n", "\n")?.replaceAll("**", "")?.replaceAll("*", "• ")
    //             setAllChats(arr1)
    //             addChat(arr1)

    //         } else {
    //             arr1[arr1?.length - 1].answer = ""
    //         }
    //     });

    //     if (document.getElementById("srcollables")) {
    //         var scrollables = document.getElementById("srcollables");
    //         document.getElementById("srcollables").scrollTo({
    //             top: scrollables.scrollHeight,
    //             behavior: 'smooth'
    //         });
    //     }

    //     return () => {
    //         socket.disconnect();
    //     };


    // }, [allChats]);

    const genAI = new GoogleGenerativeAI("AIzaSyDA81TLlcAGD2dUoVULTgrF64OXFBi4Sqo");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    async function handleQuery(arr, inputs, arrToSend) {
        if (document.getElementById("srcollables")) {
            document.getElementById("srcollables").scrollBy({ top: document.getElementById("srcollables").scrollTop + 300 })
        }

        let history = [];
        arrToSend?.map((item) => {
            history.push(
                { role: "user", parts: [{ text: item?.question }] },
                { role: "model", parts: [{ text: item?.answer }] }
            );
        });
        console.log(history)
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessageStream(inputs);
        let arr1 = [...arr]

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            console.log(arr1);
            console.log(arr1[arr1?.length - 1]);

            if (arr1[arr1?.length - 1]) {
                const updatedAnswer = (arr1[arr1?.length - 1].answer || '') + chunkText?.replaceAll("\n\n", "\n")?.replaceAll("**", "")?.replaceAll("*", "• ");
                arr1 = [...arr1.slice(0, -1), { ...arr1[arr1.length - 1], answer: updatedAnswer }];
                setAllChats(arr1);
                if (document.getElementById("srcollables")) {
                    document.getElementById("srcollables").scrollBy({ top: document.getElementById("srcollables").scrollTop + 300 })
                }
            } else {
                arr1[arr1?.length - 1].answer = "";
            }
            console.log(chunkText);
        }
        addChat(arr1)
        // srcollables
        console.log(inputs)
        // await axios.post(`http://localhost:8000/generate`, {
        //     prompt: inputs,
        //     history: arrToSend
        // })
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
        // const room = Math.random().toString()
        // io('https://gemini-chat-socket.onrender.com').emit('joinRoom', room);
        // io('https://gemini-chat-socket.onrender.com').emit('message', { text: inputs, array: arrToSend, room: room });
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
                                        {/* {item?.before === false ?
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
                                        } */}
                                        {
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
                                        }
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
                <div className="icons">
                    <img src={paper} alt="" onClick={() => {
                        if (currentQuestion !== "") {
                            let arr = [...allChats]
                            arr.push({ question: currentQuestion, answer: " ", before: false })
                            setAllChats(arr)
                            setCurrentQuestion("")
                            handleQuery(arr, "" + currentQuestion, allChats)
                        }
                    }} />
                    <img
                        src={mic}
                        alt="Mic"
                        onClick={() => {
                            setIsRecording(true)
                            if (!isRecording) {
                                startRecording()
                            } else {
                                stopRecording()
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    {/* <img
                        src={upload}
                        alt="Upload"
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer' }}
                    /> */}
                    {/* <input
                        type="file"
                        accept="audio/*"
                        ref={audioInputRef}
                        style={{ display: 'none' }}
                        onChange={handleAudioChange}
                    /> */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    {/* <audio src={audioURL} controls /> */}
                </div>

            </div>
        </div>
    )
}
