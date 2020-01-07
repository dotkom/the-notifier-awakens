import React, { useState, useEffect } from 'react';
import './Logo.css';

const Logo = props => {
  const daysBefore = 3;
  const toTime = new Date(2019, 10, 22, 12, 0, 0).getTime();
  const fromTime = toTime - daysBefore * 24 * 60 * 60 * 1000;
  const [initialTime] = useState(Date.now());
  const [time, setTime] = useState(Date.now());
  const [intervalID, setIntervalID] = useState(null);
  const dd = x => x.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const formatDate = x => {
    const time = new Date(x);
    const days = time.getUTCDate() - 1;
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
    if (toTime > Date.now()) {
      setIntervalID(
        setInterval(() => {
          setTime(Date.now());
        }, 1000),
      );
    } else {
      const components = document.querySelector('.Components');
      const [a, b, c, d, e, f, g, h, i, j, k, l] = parseInt(
        (('891274' >> 8) + 'DEADBEEF')
          .split('')
          .reverse()
          .join(''),
        16,
      ).toString(16);
      const djilahkfbgce = d + j + i + l + a + h + k + f + b + g + c + e;
      const lol =
        `${String.fromCharCode((g + j).charCodeAt(1) + 48)}` +
        String.fromCharCode(a.charCodeAt(0) + 13) +
        String.fromCharCode(i.charCodeAt(0) + 63) +
        String.fromCharCode(k.charCodeAt(0) - 7);
      components.style = `background-image: url(https://online.ntnu.no/static/img/${lol}${djilahkfbgce}.svg), url(/onlineplanet.svg);`;
    }

    return () => {
      if (intervalID !== null) {
        clearInterval(intervalID);
      }
    };
  }, []);

  useEffect(() => {
    if (time >= toTime && initialTime < toTime) {
      window.location.reload();
    }
    setTimeFormatted(formatDate(toTime - time));
  }, [time]);

  const { days, hours, minutes, seconds } = timeFormatted;

  return (
    <div>
      {time < toTime && time > fromTime ? (
        <div className="countdown">
          <div>
            {days ? (
              <div>
                <h1>{days}</h1>
                <p>Dag{days === 1 ? '' : 'er'}</p>
              </div>
            ) : null}
            {days || hours ? (
              <div>
                <h1>{dd(hours)}</h1>
                <p>Time{hours === 1 ? '' : 'r'}</p>
              </div>
            ) : null}
          </div>
          <div>
            {days || hours || minutes ? (
              <div>
                <h1>{dd(minutes)}</h1>
                <p>Minutt{minutes === 1 ? '' : 'er'}</p>
              </div>
            ) : null}
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
