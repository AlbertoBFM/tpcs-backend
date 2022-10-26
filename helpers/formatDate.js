const padTo2Digits = num => num.toString().padStart( 2, '0' );

const formatDate = (date, days) => {
    date.setDate(date.getDate() + days );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ year }-${ month }-${ day }T04:00:00`;
}

// const formatDateEnd = (date, days) => {
//     date.setDate(date.getDate() + days );
//     const day = padTo2Digits( date.getDate() );
//     const month = padTo2Digits( date.getMonth() + 1 );
//     const year = date.getFullYear();

//     return `${ year }-${ month }-${ day }T04:00:00`;
// }

module.exports = {
    formatDate,
    // formatDateEnd
}