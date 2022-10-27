const padTo2Digits = num => num.toString().padStart( 2, '0' );

const formatDateToQuery = (date, days) => {
    date.setDate(date.getDate() + days );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ year }-${ month }-${ day }T04:00:00`;
}

const formatDate = (date, days) => {
    date.setDate(date.getDate() + days );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ day }/${ month }/${ year }`;
}

const formatTime = (date) => {
    const hours = padTo2Digits( date.getHours() );
    const minutes = padTo2Digits( date.getMinutes() );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ hours }:${ minutes } - ${ day }/${ month }/${ year }`;
}

module.exports = {
    formatDateToQuery,
    formatDate,
    formatTime
}