const { graphql } = require('@octokit/graphql')
require('dotenv/config')

async function repo() {
  const mytoken = `${process.env.GITHUB_TOKEN}`
  const { repository, viewer } = await graphql(
    /* 아래는 요청할 쿼리가 들어가는 영역 */
    `
      {
        repository(owner: "BDD-CLUB", name: "every-week-posting-challenge") {
          discussions(first: 10) {
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
        authorization: `token ${mytoken}`,
      },
    }
  )
  console.log(
    repository.discussions.totalCount,
    repository.discussions.edges.map(edge => edge.node.category),
    viewer
  )
  console.log(process.env)
  return { repository, viewer }
}

repo()
