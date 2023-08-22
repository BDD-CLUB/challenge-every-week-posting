const { graphql } = require('@octokit/graphql')

async function repo() {
  const mytoken = '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'
  const { repository, viewer } = await graphql(
    /* 아래는 요청할 쿼리가 들어가는 영역 */
    `
      {
        repository(owner: "amaran-th", name: "every-week-posting-challenge") {
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
    repository.discussions.edges,
    viewer
  )
  return { repository, viewer }
}

repo()
