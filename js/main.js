'use strict';

const firebaseConfig = {
  apiKey: "AIzaSyCTgjrDUdXFjFcrzG3BQPRp8rV-gaewDjo",
  authDomain: "myfirebasechatapp-5cafa.firebaseapp.com",
  projectId: "myfirebasechatapp-5cafa",
  storageBucket: "myfirebasechatapp-5cafa.appspot.com",
  messagingSenderId: "171821475184",
  appId: "1:171821475184:web:07d2819dd522a97d79dbb5"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

const collection = db.collection('messages');

const auth = firebase.auth();
let me = null;

const message = document.getElementById('message');
const form = document.querySelector('form');
const messages = document.getElementById('messages');
const login = document.getElementById('login');
const logout = document.getElementById('logout');

login.addEventListener('click', () =>{
  auth.signInAnonymously();
});

logout.addEventListener('click', () =>{
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    me = user;

    while(messages.firstChild) {
      messages.removeChild(messages.firstChild);
    }

    collection.orderBy('created').onSnapshot(snapshot =>{
      snapshot.docChanges().forEach(change =>{
        if (change.type === 'added') {
          const li = document.createElement('li');
          const d = change.doc.data()
          li.textContent = d.uid.substr(0, 8) + ': ' + d.message;
          messages.appendChild(li);
        }
      });
    }, error => {});
    
    console.log(`${user.uid}がログインしています`);
    login.classList.add('hidden');
    [logout,form,messages].forEach(el => {
      el.classList.remove('hidden');
    });
    message.focus();
    return;
  }
  me = null;
  console.log('誰もいません');
  login.classList.remove('hidden');
  [logout,form,messages].forEach(el => {
    el.classList.add('hidden');
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const val = message.value.trim();
  if (val === '') {
    return;
  }

  message.value = '';
  message.focus();

  collection.add({
    message: val,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    uid: me ? me.uid : 'nobody'
  })
  .then(doc => {
    console.log(`${doc.id} added!`);
  })
  .catch(error => {
    console.log('書き込めなかったよ');
    console.log('error');
  });
});


