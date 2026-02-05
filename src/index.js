import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError, switchMap } from 'rxjs/operators';
import './style.css';

const API_URL = 'https://rxjs-backend-nnvz.onrender.com/messages/unread';

const messagesList = document.getElementById('messages-list');


function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}.${month}.${year}`;
}


function truncateSubject(subject) {
    return subject.length > 15 ? subject.slice(0, 15) + '...' : subject;
}

function renderMessage(message) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>${message.from}</td>
        <td class="message-subject">${truncateSubject(message.subject)}</td>
        <td>${formatDate(message.received)}</td>
    `;
    

    messagesList.prepend(tr);
}


const stream$ = interval(3000).pipe(
    switchMap(() => 
        ajax.getJSON(API_URL).pipe(
            catchError(error => {
                console.error('Error:', error);
                return of({ messages: [] });
            })
        )
    ),
    map(response => response.messages)
);

const subscription = stream$.subscribe(messages => {
    if (messages && messages.length > 0) {
        messages.forEach(message => renderMessage(message));
    }
});

window.addEventListener('beforeunload', () => {
    subscription.unsubscribe();
    console.log('Polling stopped');
});