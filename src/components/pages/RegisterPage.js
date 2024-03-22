import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import axios from 'axios'

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const signUp = async () => {
        await axios.post("http://localhost:8000/signup", {
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
            <h2 style={{fontSize: '2rem', marginBottom: 0}}>Join us</h2>
            <h5 style={{fontSize: '1.1rem', marginBottom: 0, marginTop: '1rem'}}>Create your personal account</h5>
            <form onSubmit={(e) => {
                e.preventDefault()
                signUp()
            }}>
                <p>
                    <label>Email address</label><br/>
                    <input type="email" name="email" required className='in' value={email} onChange={(e) => {
                        setEmail(e.target.value)
                    }}/>
                </p>
                <p>
                    <label>Password</label><br/>
                    <input type="password" name="password" required className='in' password={password} onChange={(e) => {
                        setPassword(e.target.value)
                    }}/>
                </p>
                <p>
                    <button id="sub_btn" type="submit">Register</button>
                </p>
            </form>
            <footer>
                <p>Already have an account? <Link to="/" className='abc'>Login</Link>.</p>
            </footer>
        </div>
    )

}
