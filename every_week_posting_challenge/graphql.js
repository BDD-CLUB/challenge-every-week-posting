const { graphql } = require('@octokit/graphql')
require('dotenv/config')

exports.getDiscussions = async function getDiscussions() {
  return await graphql(
    `
      {
        repository(owner: "amaran-th", name: "every-week-posting-challenge") {
          discussions(first: 100) {
            totalCount
            edges {
              node {
                id
                title
                createdAt
                url
                author {
                  login
                  avatarUrl
                }
                category {
                  id
                  name
                }
              }
            }
          }
        }
        viewer {
          login
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  )
}

exports.getNotifyDiscussions = async function getNotifyDiscussions() {
  return await graphql(
    `
      {
        repository(owner: "amaran-th", name: "every-week-posting-challenge") {
          discussions(first: 100, categoryId: "DIC_kwDOJjgAhs4CWp1V") {
            totalCount
          }
        }
        viewer {
          login
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  )
}

exports.createDiscussion = async function createDiscussion(title, body) {
  return await graphql(
    `mutation {
            createDiscussion(input: {repositoryId: "R_kgDOJjgAhg", categoryId: "DIC_kwDOJjgAhs4CWp1V", body: "${body}", title: "${title}"}) {
                discussion {
                  id
                }
              }
        }
      `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  )
}
