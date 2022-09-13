

const numberRange = ( value, min, max ) => {

    if ( !value ) return false;

    if ( typeof value !== 'number' ) return false;

    if ( value >= min && value <= max ) return true;

    return false;

}

module.exports = {
    numberRange
}