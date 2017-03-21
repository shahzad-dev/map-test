import chokidar from 'chokidar';
import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import {clean} from 'require-clean';
import {exec} from 'child_process';

const APP_PORT = 3000;
const GRAPHQL_PORT = 8000;

let graphQLServer;
let appServer;
let modulesDirectories = ['node_modules','js/assets'];
let loaders = {
    /*'jsx': {
      loader: babelLoaderStringFinal,
      include: [jsRoot]
    },
    'js': {
        loader: babelLoaderStringFinal,
        include: [jsRoot]
    },*/
    //'json': 'json-loader',
    //'json5': 'json5-loader',
    //'txt': 'raw-loader',
    'png|jpg|jpeg|gif|svg': 'url-loader?limit=10000',
    //'woff|woff2': 'url-loader?limit=100000',
    //'ttf|eot': 'file-loader',
    //'wav|mp3': 'file-loader',
    // 'html': 'html-loader',
    //'md|markdown': ['html-loader', 'markdown-loader']
  };

function startAppServer(callback) {
    // Serve the Relay app
    const compiler = webpack({
        entry: path.resolve(__dirname, 'js', 'app.js'),
        module: {
            loaders: [
                {
                    test: /\.(ttf|eot|woff|woff2|svg)$/,
                    loader: "url-loader?limit=10000"
                },
                {
                    exclude: /node_modules/,
                    loader: 'babel',
                    test: /\.js$/
                }
            ]
        },
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015', 'stage-0'],
          plugins: [
            'transform-decorators-legacy',
          ]
      },
      resolve: { // где искать модули
         modulesDirectories: modulesDirectories,
     },
        output: {
            filename: '/app.js',
            path: '/',
            publicPath: '/js/'
        }
    });
    appServer = new WebpackDevServer(compiler, {
        contentBase: '/public/',
        proxy: {
            '/graphql': `http://localhost:${GRAPHQL_PORT}`
        },
        publicPath: '/js/',
        stats: {
            colors: true,
            chunks: false,
            stats: 'errors-only'
        }
    });
    // Serve static resources
    appServer.use('/', express.static(path.resolve(__dirname, 'public')));
    appServer.listen(APP_PORT, () => {
        console.log(`App is now running on http://localhost:${APP_PORT}`);
        if (callback) {
            callback();
        }
    });
}

function startGraphQLServer(callback) {
    // Expose a GraphQL endpoint
    clean('./data/schema');
    const {Schema} = require('./data/schema');
    const graphQLApp = express();
    graphQLApp.use('/', graphQLHTTP({graphiql: true, pretty: true, schema: Schema}));
    graphQLServer = graphQLApp.listen(GRAPHQL_PORT, () => {
        console.log(`GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`);
        if (callback) {
            callback();
        }
    });
}

function startServers(callback) {
    // Shut down the servers
    if (appServer) {
        appServer.listeningApp.close();
    }
    if (graphQLServer) {
        graphQLServer.close();
    }

    // Compile the schema
    exec('npm run update-schema', (error, stdout) => {
        console.log(stdout);
        let doneTasks = 0;
        function handleTaskDone() {
            doneTasks++;
            if (doneTasks === 2 && callback) {
                callback();
            }
        }
        startGraphQLServer(handleTaskDone);
        startAppServer(handleTaskDone);
    });
}
const watcher = chokidar.watch('./data/{database,schema}.js');
watcher.on('change', path => {
    console.log(`\`${path}\` changed. Restarting.`);
    startServers(() => console.log('Restart your browser to use the updated schema.'));
});
startServers();
