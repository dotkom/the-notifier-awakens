import React, { Component } from 'react';

export default class GitHub extends Component {
  render() {
    const { repos = [] } = this.props;
    return (
      <div className="github-repos">
        <h3>{this.props.translate(this.props.user)} repos</h3>
        <ul>
          {repos.map((repo, i) => (
            <li key={i}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={repo.html_url}
                className="repo"
              >
                {repo.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
