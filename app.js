/*/=================================================================================================/
/===>APP BLOG EM NODEJS<====/

    ==/DADOS DE PROJETO/==
    =>EMPRESA DESENVOLVEDORA: BMS TECHNOLOGY
    =>DESCRIÇÃO: app desenvolvido para aprender nodejs
/=================================================================================================/*/



/*/===/CARREGAR DADOS SIGILOGOS/============================================================================/
*/
require('dotenv').config();

/*/===/CONSTANTES DE PROJETO/======================================================================/
*/
const PORT = 3000;

/*/===/IMPORTAÇÕES DOS MÓDULOS/====================================================================/
*/
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('./routes/admin.js');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Posts');
const posts = mongoose.model('posts');

/*/===/CONFIGURAÇÕES/==============================================================================/
*/
app.use(session({
    secret: 'keysession',
    resave: true,
    saveUninitialized: true,
    cookie: {secure: true}
}));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));

/*/===/MIDDLEWARES/===========================================================================/
*/
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

/*/===/ROTAS/======================================================================================/
*/
app.use('/', (req,res)=>{
    posts.find().populate('categoria').sort({date: 'desc'}).lean()
        .then(posts =>{
            res.render('index', {posts: posts})
        })
        .catch(e => {
            req.flash('error_msg', 'Erro Interno.\nErro: ' + e);
            res.render('/404');
            res.redirect('/404');
            console.log('aqui')
        })
})

app.use('/admin', admin);

console.log('entrei aqui 1')

app.get('/posts/:slug', (req, res)=>{
    
    console.log('entrei aqui 2')
    posts.findOne({slug: req.params.slug}).lean()
    .then((posts)=>{
        if(posts){
            res.render('/posts/index.handlebars', {posts: posts})
        }/*else{
            req.flash('error_msg', 'Projeto Inexistente.\nErro: ' + e);
            res.redirect('/');
        }*/
        
    })
    .catch(e => {
        req.flash('error_msg', 'Erro Interno.\nErro: ' + e);

        res.redirect('/');
    })
})

app.all('*', (req,res)=>{
    console.log('erro aqui')
    res.render('/404.handlebars');
})

/*/===/CONECTANDO COM MONGO/=======================================================================/
*/
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { app.emit('db_online'); })
    .catch(e => console.log('Erro ao se conectar ao banco de dados.\nErro: ' + e));

/*/===/ATUALIZANDO O SERVIDOR/=======================================================================/
*/
app.listen(PORT, () => { console.log('\nWarning...\nDatabase synchronized in http://127.0.0.1:3000') });

/*/===============================================================================================/*/
