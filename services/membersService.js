const db = require('../db/membersQueries')

const waitingPeriod = 4
const validPeriod = 12
const gracePeriod = 6

const getMember = async username => {
    const memberInformation = await db.getMember(username)
    if(!memberInformation) return null

    const member = {
        username: memberInformation.username,
        isExpiredMember: isExpired(memberInformation.username),
        canVote: canVote(memberInformation.username)
    }
    return member
}

const registerMember = async username => {
    const currDate = new Date()
    const canVoteDate = addMonthsToDate(waitingPeriod, currDate)
    
    const member = {
        username: username,
        registerDate: currDate,
        canVoteDate: canVoteDate
    }
    db.createMember(member)
}

const canVote = async username => {
    const member = await db.getMember(username)
    const currDate = new Date()
    return currDate >= member.canvote_date
}

const isExpired = async username => {
    const member = await db.getMember(username)
    const currDate = new Date()
    const expirationDate = addMonthsToDate(validPeriod, currDate)
    return currDate >= expirationDate
}

const renovateMember = async username => {
    const member = await db.getMember(username)
    const currDate = new Date()
    member.register_date = currDate
    
    const gracePeriodExpired = currDate >= addMonthsToDate(validPeriod + gracePeriod, currDate)
    
    const canVoteDate = (gracePeriodExpired ? addMonthsToDate(waitingPeriod, currDate) : currDate)
    member.canvote_date += canVoteDate
    db.updateMember(member)
}

const addMonthsToDate = (numMonths, date) => {
    const newMonth = date.getMonth() + numMonths
    let newDate = new Date(date)
    newDate = newDate.setMonth(newMonth)
    return newDate
}

module.exports = {
    getMember: getMember,
    registerMember: registerMember,
    canVote: canVote,
    isExpired: isExpired,
    renovateMember: renovateMember
}