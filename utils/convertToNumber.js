// Takes an array of objects and convert every MySQL Decimal to Number
const convertMySQLDecimalToNumber = (arrayOfObjects) => {
    return arrayOfObjects.map((object) => {
        const keys = Object.keys(object);
        for (let key of keys) {
            const value = object[key];
            const number = Number(value);
            if (!isNaN(number)) object[key] = number;
        }
        return object;
    });
};

module.exports = {
    convertMySQLDecimalToNumber,
};
