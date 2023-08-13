const app = require('./app');
function startServer(){
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
}
module.exports = startServer;
