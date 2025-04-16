

export const getAllData = async () => {
    const data = await getData()
    return assignTeamLogosUrl(data)
}

export const getPositions = async () => {
    const data = await getData()
    let response = null
    if (typeof data !== 'undefined' && data != null) {
        response = {
            firstTournament: [],
            secondTournament: [],
            globalPositions: []
        }
        response.firstTournament = calculatePositions('firstTournament', data)
        response.secondTournament = calculatePositions('secondTournament', data)
        response.globalPositions = calculateGlobalPositions(response.firstTournament, response.secondTournament)
    }
    return response
}


const getData = async () => {
    const url = process.env.DATA_FILE_URL ? `${process.env.DATA_FILE_URL}` : ''
    const res = await fetch(`${url}`)
    return await res.json()
}

const assignTeamLogosUrl = (data) => {
    if(typeof data !== 'undefined' && data !== null) {
        data.teamsInfo.forEach(teamInfo => {
            teamInfo.logo = process.env.LIGA_TICA_API_URL + teamInfo.logo
        })
    }
    return data
}

const calculatePositions = (tournament, data) => {
    const positions = initPositions()
    const matchdays = data[tournament].matchdays
    matchdays.forEach(matchday => {
        matchday.matches.forEach(match => {
            if (match.played) {
                const localTeam = positions.find((data) => data.team == match.local.team)
                localTeam.pj++
                localTeam.gf += match.local.goals
                localTeam.gc += match.visitor.goals
                localTeam.dif = localTeam.gf - localTeam.gc
                const localTeamMatchPts = match.visitor.goals < match.local.goals ? 3 : (match.visitor.goals == match.local.goals ? 1 : 0)
                localTeam.pts += localTeamMatchPts
                if (localTeamMatchPts == 3) {
                    localTeam.pg++
                }
                else if (localTeamMatchPts == 1) {
                    localTeam.pe++
                }
                else {
                    localTeam.pp++
                }
                const visitorTeam = positions.find((data) => data.team == match.visitor.team)
                visitorTeam.pj++
                visitorTeam.gf += match.visitor.goals
                visitorTeam.gc += match.local.goals
                visitorTeam.dif = visitorTeam.gf - visitorTeam.gc
                const visitorTeamMatchPts = match.local.goals < match.visitor.goals ? 3 : (match.local.goals == match.visitor.goals ? 1 : 0)
                visitorTeam.pts += visitorTeamMatchPts
                if (visitorTeamMatchPts == 3) {
                    visitorTeam.pg++
                }
                else if (visitorTeamMatchPts == 1) {
                    visitorTeam.pe++
                }
                else {
                    visitorTeam.pp++
                }
            }
        })
    });
    sortPositions(positions, matchdays)
    return positions
}

const initPositions = () => {
    return [
        { team: "Saprissa", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Alajuelense", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Herediano", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Cartaginés", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "P. Zeledón", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Guanacasteca", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Liberia", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "San Carlos", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Puntarenas", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Sporting", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Santos", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
        { team: "Santa Ana", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
    ]
}

const sortPositions = (positions, matchdays = null) => {
    positions.sort((a, b) => {
        if (a.pts !== b.pts) {
            return b.pts - a.pts
        }
        if (a.dif !== b.dif) {
            return b.dif - a.dif
        }
        if (a.gf !== b.gf) {
            return b.gf - a.gf
        }
        if (matchdays != null) {
            const particularMatchResult = checkParticularMatch(matchdays, a, b)
            if (particularMatchResult != 0) {
                return particularMatchResult
            }
        }
        return b.gc - a.gc
    })
}

const checkParticularMatch = (matchdays, posA, posB) => {
    let localAMatchWinner = ''
    let localAMatch = null
    let localBMatchWinner = ''
    let localBMatch = null
    matchdays.forEach((matchday) => {
        localAMatch = matchday.matches.find((match) => match.local.team == posA.team && match.visitor.team == posB.team)
        if (localAMatch != null) return
    })
    matchdays.forEach((matchday) => {
        localBMatch = matchday.matches.find((match) => match.local.team == posB.team && match.visitor.team == posA.team)
        if (localBMatch != null) return
    })
    if (localAMatch != null) {
        localAMatchWinner = localAMatch.local.goals > localAMatch.visitor.goals ? 'A' : (localAMatch.local.goals < localAMatch.visitor.goals ? 'B' : '-')
    }
    if (localBMatch != null) {
        localBMatchWinner = localBMatch.local.goals > localBMatch.visitor.goals ? 'A' : (localBMatch.local.goals < localBMatch.visitor.goals ? 'B' : '-')
    }
    if (localAMatchWinner == 'A' && localBMatchWinner == 'A') {
        return -1
    } else if (localAMatchWinner == 'B' && localBMatchWinner == 'B') {
        return 1
    } else {
        if (localAMatch == null || localBMatch == null) {
            return 0
        }
        const totalAGoals = localAMatch.local.goals + localBMatch.visitor.goals
        const totalBGoals = localAMatch.visitor.goals + localBMatch.local.goals
        return totalAGoals > totalBGoals ? -1 : (totalAGoals < totalBGoals ? 1 : 0)
    }
}

const calculateGlobalPositions = (firstTournamentPositions, secondTournamentPositions) => {
    const globalPositions = initPositions()
    firstTournamentPositions.forEach(position => {
        const teamPosition = globalPositions.find((pos) => pos.team == position.team)
        teamPosition.pj += position.pj
        teamPosition.pg += position.pg
        teamPosition.pe += position.pe
        teamPosition.pp += position.pp
        teamPosition.gf += position.gf
        teamPosition.gc += position.gc
        teamPosition.dif += position.dif
        teamPosition.pts += position.pts
    })
    secondTournamentPositions.forEach(position => {
        const teamPosition = globalPositions.find((pos) => pos.team == position.team)
        teamPosition.pj += position.pj
        teamPosition.pg += position.pg
        teamPosition.pe += position.pe
        teamPosition.pp += position.pp
        teamPosition.gf += position.gf
        teamPosition.gc += position.gc
        teamPosition.dif += position.dif
        teamPosition.pts += position.pts
    })
    sortPositions(globalPositions)
    return globalPositions
}