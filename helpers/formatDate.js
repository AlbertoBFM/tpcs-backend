const padTo2Digits = num => num.toString().padStart( 2, '0' );

const formatDateToQuery = (date, days) => {
    date.setDate(date.getDate() + days );
    const day = padTo2Digits( date.getDate() );
    const month = padTo2Digits( date.getMonth() + 1 );
    const year = date.getFullYear();

    return `${ year }-${ month }-${ day }T00:00:00`;
}

const formatDateByMonths = () => {

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    
    const monthStart = padTo2Digits( start.getMonth() + 1 );
    const yearStart = start.getFullYear();
    
    const monthEnd = padTo2Digits( end.getMonth() + 1 );
    const yearEnd = end.getFullYear();
    
    const days = new Date( yearStart, monthStart, 0 ).getDate();

    return {
        start: `${ yearStart }-${ monthStart }-01T00:00:00`,
        end: `${ yearEnd }-${ monthEnd }-01T00:00:00`,
        days,
        monthName: monthNames[start.getMonth()]
    };
}

const formatDateByDay = ( day, start ) => {
    const month = padTo2Digits( start.getMonth() + 1 );
    const year = start.getFullYear();
    const dayStart = padTo2Digits( day );
    const dayEnd = padTo2Digits( day + 1 );
    
    return {
        startOfDay: new Date(`${ year }-${ month }-${ dayStart }T00:00:00`),
        endOfDay: new Date(`${ year }-${ month }-${ dayEnd }T00:00:00`),
    };
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
    formatDateByMonths,
    formatDateByDay,
    formatDate,
    formatTime,
}