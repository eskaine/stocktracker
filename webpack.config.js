'use strict';

const path = require('path');

module.exports = {
    entry: './app/client/mainController.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname + '/public/js')
    },
    watch: true,

    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            }

        ]
    }
};
