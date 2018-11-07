import React, { Component } from 'react';
import './Articles.css';

export default class Articles extends Component {
  render() {
    const { articles = [] } = this.props;
    return (
      <div className="articles">
        {articles.map((a, i) => {
          const style = {
            backgroundImage: `url(${a.image})`,
          };
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={a.link}
              key={i}
              style={style}
              className="article"
            >
              <span className="article-title">{a.title}</span>
              <span className="article-author">{a.author}</span>
            </a>
          );
        })}
      </div>
    );
  }
}
