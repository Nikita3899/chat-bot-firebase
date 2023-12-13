import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, orderBy, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging } from "firebase/messaging";
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = { apiKey: "AIzaSyDmAXvkdghVTk30k3NBRwTpsd1aJdGOY_k",
authDomain: "messaging-app-fdafd.firebaseapp.com",
projectId: "messaging-app-fdafd",
storageBucket: "messaging-app-fdafd.appspot.com",
messagingSenderId: "412609568809",
appId: "1:412609568809:web:9bc080a3796bfc272a3c38",
measurementId: "G-5CSWVRH9D4"
}

// initializing App

const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);

// get auth and firestore instances

const auth = getAuth(app);
const firestore = getFirestore(app);


function App() {

  const [user] = useAuthState(auth);

  // async function requestPermission(){
  //   const request = await Notification.requestPermission();

  //   if(request ==='granted'){
  //     // generate token
  //   }else if(request === 'denied'){
  //     // show message 
  //     alert('Permission Denied!!')
  //   }else{
  //     // default
  //   }
  // }

  // useEffect(()=>{
  //   // requestPermission();
  // },[])

  return (
    <div className="App">
      <header>
        <h1>Chat Bot</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });

  console.log(messages,'nvkfnriuhgr')

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}/>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="...Type here" />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;