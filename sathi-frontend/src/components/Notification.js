    import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Notification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchNotification = () => {
      api.get('/notifications', { responseType: 'blob' }) // Important: set responseType to 'blob'
        .then(response => {
          if (response.status === 200 && response.data.size > 0) {
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            // Optional: Show a visual notification which the user can dismiss
            setNotification('You have an upcoming task!'); 
          }
        })
        .catch(error => {
          // It's common to get 204 No Content, so we only log other errors
          if (error.response && error.response.status !== 204) {
            console.error('Error fetching notification:', error);
          }
        });
    };

    // Check for notifications immediately when the component mounts
    fetchNotification();

    // Then check every 60 seconds
    const interval = setInterval(fetchNotification, 60000); 

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // This part is for the optional visual alert
  if (!notification) {
    return null;
  }

  return (
    <div className="notification-banner">
      <p>{notification}</p>
      <button onClick={() => setNotification(null)}>Dismiss</button>
    </div>
  );
};

export default Notification;