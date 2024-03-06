const moment = require('moment')
require('moment-timezone')
const {
  getDiscussions,
  getNotifyDiscussions,
  createDiscussion,
} = require('./graphql')
const { members, activeMembers } = require('./data')

moment.tz.setDefault('Asia/Seoul')

async function repo() {
  const { repository, viewer } = await getDiscussions()
  const now = moment()
  const last_week = now.clone().subtract(7, 'd')
  const apology_deadline = now.clone().add(6, 'd')

  const resultTitle = await makeTitle(last_week, now)

  const filteredDiscussions = filterThisWeekDiscussion(repository, last_week)
  const thisWeekDiscussionCount = filteredDiscussions.length

  const result = makeResult(filteredDiscussions)
  const notPostingMembers = makeNotPostingMembers(result)

  const resultContent = makeContent(
    thisWeekDiscussionCount,
    result,
    notPostingMembers,
    apology_deadline
  )
  await createDiscussion(resultTitle, resultContent)
    .then(() => {
      console.log('통계가 성공적으로 업로드되었습니다.')
    })
    .catch(e => {
      console.log('문제가 발생했습니다.')
    })
  return { repository, viewer }
}

function filterThisWeekDiscussion(repository, last_week) {
  return repository.discussions.edges.filter(edge => {
    return (
      moment(edge.node.createdAt) > last_week &&
      edge.node.category.name !== '6. 반성문' &&
      edge.node.category.name !== '주간 통계' &&
      edge.node.category.name !== '실험실'
    )
  })
}

async function makeTitle(last_week, now) {
  const { repository } = await getNotifyDiscussions()
  const notificationCount = repository.discussions.totalCount
  const yesterday = now.clone().subtract(1, 'd')

  return `비글챌 ${notificationCount + 1}회차 통계(${last_week.format(
    'MM월 DD일'
  )} ~ ${yesterday.format('MM월 DD일')})`
}

function makeResult(filteredDiscussions) {
  let result = {}
  Object.keys(members)
    .filter(member =>
      activeMembers.find(activeMember => activeMember === member)
    )
    .map(member => {
      result[members[member]] = 0
    })
  filteredDiscussions.map(edge => {
    result[members[edge.node.author.login]]++
  })
  return result
}

function makeNotPostingMembers(result) {
  let notPostingMembers = []
  activeMembers.map(activeMember => {
    if (result[members[activeMember]] === 0)
      notPostingMembers.push(`${members[activeMember]}(@${activeMember})`)
  })
  return notPostingMembers
}

function makeContent(
  thisWeekDiscussionCount,
  result,
  notPostingMembers,
  apology_deadline
) {
  let resultText = ''
  Object.keys(result).map(name => {
    resultText += `| ${name} | ${result[name]} | \n  `
  })
  const notPostMembersText = notPostingMembers.join(', ')
  const notPostMembersCount = notPostingMembers.length
  return `
  ## 🥳 지난 주 챌린지 수행 결과: 총 ${thisWeekDiscussionCount}개 글 작성

  ### ✍️ 멤버별 작성한 글 수:
  
  | 닉네임 | 게시물 수 |
  | -------- | ---------- |
  ${resultText}
  
  ### 챌린지를 수행하지 않은 멤버: ${notPostMembersCount}명
  ${notPostMembersText}
  
  ### 💪 ${apology_deadline.format(
    'MM월 DD일'
  )}까지 반성문을 작성해 반성문 카테고리에 게시해주세요`
}

repo()
