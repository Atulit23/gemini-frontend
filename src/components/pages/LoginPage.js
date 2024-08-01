import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import axios from 'axios'

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()


    const login = async () => {
        await axios.post("https://agribot-main.onrender.com/login", {
            email: email,
            password: password
        }).then(res => {
            console.log(res)
            localStorage.setItem("loginId", res.data.data.user.id)
            navigate('/chat')
            window.location.reload()
        }).catch(err => {
            alert(err)
        })
    }

    return (
        <div className="text-center m-5-auto">
            <h2 style={{fontSize: '2rem', marginBottom: 0}}>Sign in to us</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                login()
            }}>
                <p>
                    <label>Username or email address</label><br/>
                    <input type="email" name="first_name" required className='in' onChange={(e) => {
                        setEmail(e.target.value)
                    }}/>
                </p>
                <p>
                    <label>Password</label>
                    {/* <Link to="/forget-password"><label className="right-label">Forget password?</label></Link> */}
                    <br/>
                    <input type="password" name="password" required className='in' onChange={(e) => {
                        setPassword(e.target.value)
                    }}/>
                </p>
                <p>
                    <button id="sub_btn" type="submit">Login</button>
                </p>
            </form>
            <footer>
                <p>First time? <Link to="/register" className='abc'>Create an account</Link>.</p>
            </footer>
        </div>
    )
}
