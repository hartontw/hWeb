const hbs = require('hbs');

hbs.registerHelper('getYear', () => new Date().getFullYear());

hbs.registerHelper('if_eq', function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    const options = arguments[arguments.length - 1];
    const allEqual = args.every(function(expression) {
        return args[0] === expression;
    });

    return allEqual ? options.fn(this) : options.inverse(this);
});

module.exports = hbs;