const online = `
  , {
    background-color: #001533;
  }

  .Components {
    background: #001533;
    background-image: url(https://online.ntnu.no/static/img/hsp.svg), url(/onlineplanet.svg);
    background-repeat: no-repeat;
    background-position: 98% 99%, center calc(100% + 125vw);
    background-size: 200px, 214.58vw;
    background-attachment: fixed;
  }
  .Header {
    background-image: url(https://online.ntnu.no/static/img/online_logo.svg);
    background-size: 60vw;
    background-repeat: no-repeat;
    background-position: bottom left;
    min-height: 18vw;
  }

  .Vakter > h1 {
    margin-top: 0.5em;
  }

  .Bus {
    display: flex;
    justify-content: center;
    justify-content: space-evenly;
    align-items: flex-start;
    flex-flow: row wrap;
    font-family: 'Righteous';
  }

  .Bus > .bus-wrapper {
    background-color: #000000bb;
    color: #fff;
    clip-path: polygon(0 3%,
      30% 0, 70% 6%,
      100% 0, 100% 97%,
      70% 100%, 30% 94%,
      0 100%);
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    padding-bottom: 2em;
    max-width: 720px;
    margin: 0 1em;
    flex: 1 1 544px;
    min-height: 280px;
  }

  .Bus .bus-stop {
    flex: 1 0 100%;
    margin-bottom: 0;
    text-align: center;
  }

  .Bus .bus-dir {
    flex: 1 0 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .Bus .bus-dir-item {
    margin-top: 0;
    flex: 0 0 auto;
  }
  .Bus .bus-dir-item:first-child {
    margin-left: 4.6em;
  }
  .Bus .bus-dir-item:last-child {
    margin-right: 4.5em;
    margin-left: 3.5em;
  }

  .Bus .bus-list-row {
    flex: 0 0 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .Bus .bus-list {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
  }
  .Bus .bus-list:first-child {
    margin-left: 5em;
  }
  .Bus .bus-list:last-child {
    margin-right: 5em;
    margin-left: 3.5em;
  }

  .Bus .bus-list-item {
    display: flex;
    flex-flow: row nowrap;
  }
  .Bus .bus-list-item-number {
    min-width: 1.5em;
    text-align: left;
    position: relative;
  }
  .Bus .bus-list-item-number.is-close::before {
    background-image: url(/spaceship.svg);
    content: '';
    display: block;
    width: 2em;
    height: 1em;
    background-size: contain;
    background-repeat: no-repeat;
    position: absolute;
    margin-top: 0.25em;
    right: 120%;
  }

  .Bus .bus-list-item-time {
    color: #ffffff88;
  }
  .Bus .bus-list-item-time::before {
    color: #ffffff88;
    content: "- ";
  }
`;

const smartMirror = `
, {
  /*background-color: #121280;*/
}

.App {
  /*background: #121280;*/
}
`;

export { online, smartMirror };
