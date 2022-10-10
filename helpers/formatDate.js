const padTo2Digits = num => num.toString().padStart( 2, '0' );

const formatDate = (date, hours) => {
    date.setDate(date.getDate() + hours );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ year }-${ month }-${ day }`;
}

module.exports = {
    formatDate
}