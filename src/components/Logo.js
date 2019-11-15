import React, { useState, useEffect } from 'react';
import './Logo.css';

const Logo = props => {
  const daysBefore = 0;
  const fromTime = new Date(2019, 10, 15 - daysBefore, 0, 49, 0);
  const toTime = new Date(2019, 10, 15, 0, 50, 0);
  const [time, setTime] = useState(toTime - Date.now());
  const [intervalID, setIntervalID] = useState(null);
  const dd = x => x.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const formatDate = x => {
    const time = new Date(x);
    const days = time.getDate() - 1;
    const hours = (time.getHours() - 1 + 24) % 24;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    return {
      days,
      hours,
      minutes,
      seconds,
    };
  };
  const [timeFormatted, setTimeFormatted] = useState(formatDate(time));

  useEffect(() => {
    if (toTime - Date.now() > 0 && fromTime - Date.now() < 0) {
      setIntervalID(
        setInterval(() => {
          setTime(toTime - Date.now());
        }, 100),
      );
    }

    return () => {
      if (intervalID !== null) {
        clearInterval(intervalID);
      }
    };
  }, []);

  useEffect(() => {
    setTimeFormatted(formatDate(time));
  }, [time]);

  const { days, hours, minutes, seconds } = timeFormatted;

  return (
    <div>
      {time > 0 && days < daysBefore ? (
        <div className="countdown">
          <div>
            <div>
              <h1>{days}</h1>
              <p>Dag{days === 1 ? '' : 'er'}</p>
            </div>
            <div>
              <h1>{dd(hours)}</h1>
              <p>Time{hours === 1 ? '' : 'r'}</p>
            </div>
          </div>
          <div>
            <div>
              <h1>{dd(minutes)}</h1>
              <p>Minutt{minutes === 1 ? '' : 'er'}</p>
            </div>
            <div>
              <h1>{dd(seconds)}</h1>
              <p>Sekund{seconds === 1 ? '' : 'er'}</p>
            </div>
          </div>
        </div>
      ) : (
        <img
          style={{ filter: props.filter || '' }}
          className="logo-container"
          alt={`Logo for ${props.translate(props.affiliation)}`}
          src={props.url}
        />
      )}
    </div>
  );
};

export default Logo;
