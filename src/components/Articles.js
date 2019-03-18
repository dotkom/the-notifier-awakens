import React, { Component } from 'react';
import { Loading } from './';
import './Articles.css';

export default class Articles extends Component {
  render() {
    const { articles = [], IfPropIsOnline } = this.props;
    return (
      <div className="articles">
        <IfPropIsOnline
          prop="articles"
          props={this.props}
          else={apiName => `Kunne ikke koble til ${apiName}`}
          loading={<Loading />}
        >
          {(Array.isArray(articles) ? articles : []).map((a, i) => {
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
        </IfPropIsOnline>
      </div>
    );
  }
}
