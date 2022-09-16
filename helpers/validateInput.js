

const numberRange = ( value, min, max ) => {

    if ( !value ) return false;

    if ( typeof Number(value) !== 'number' ) return false;

    if ( Number(value) >= min && Number(value) <= max ) return true;

    return false;

}

module.exports = {
    numberRange
}