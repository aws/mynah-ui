# Mynah UI Example (IDE look&feel)

To start the example, simply run the following script through your terminal in the root folder.

```console
npm install && npm run watch & cd ./example && npm install && npm run watch
```

After the whole script runs, go to the folder `./example/dist` and open `index.html` in your favorite ever-green borwser. 

The steps in the script as follows:
- First we're installing dependencies for the `mynah-ui`
- After that we're running the `mynah-ui` in watch mode since we're gonna use it lively, which means that whenever you change something on the mynah-ui library, it will take affect directly on the example app running
- Now we're going into the `./example` folder and installing the dependencies of the example app.
- After all, we're running the example in watch mode, to be able to see the changes take affeect immediately after we do the changes and refresh the browser tab.

If you check the dependencies of the example, you'll see that mynah-ui dependency is connected to the parent folder. Which allows us to use the mynah-ui directly from the parent folder instead of a npm dependency. 

If you want, you can run `mynah-ui` and example scripts in separate terminals to see their watch processes separetely. 

If you just need the builded version (no need to watch the changes) simply run the below and open the `index.html` inside `./example/dist` folder in your browser.

From your root folder;
```console
npm install && npm run build && cd ./example && npm install && npm run build
```

### Supported browsers
**Mynah UI** <em>-because of it's extensive css structure-</em> only supports ever-green browsers including webkit based WebUI renderers.

---

#### Please do check the root folder [README.md](../README.md) for the usage guidelines, license information and other helpful guides.
