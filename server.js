/*
__________________________________________________________________________________________________
MODELO DE PROJETO
__________________________________________________________________________________________________
*/




/*DOTENV

R: 
referente as variaveis de ambiente relacionadas ao projeto e são salvas em um arquivo
.env que oferece uma segurança e não envia a senha como variável púclica.

instale o dotenv:       npm install dotenv --save
Crie um arquivo         .env
insira a chave/valor:   S3_BUCKET = " YOURS3BUCKET "
importe com:            require('dotenv').config(); 
________________________________________________________________________________________________
*/
require('dotenv').config();


/*EXPRESS  

R:
framework para configurar o seu ambiente de desenvolvimento 
e como executar tarefas comuns de desenvolvimento e implantação da web.

npm install express
________________________________________________________________________________________________
*/
const express = require('express'); // importanto a framework
const app = express(); // para aplicação da framework


/*MONGOOSE

R:
Mongoose é uma biblioteca de programação orientada a objetos JavaScript 
que cria uma conexão entre o MongoDB e o ambiente de tempo de execução
JavaScript Node.js. 
const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/web-app');
________________________________________________________________________________________________
*/
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // emite um evento (on_mongoDB) quando é finalizado o processo de conexão para que posteriormente
        // poassa ser inicializado o listen do DB
        console.log('Connection to MongoDB was successfully performed...')
        app.emit('on_mongoDB');
    })
    .catch(e => console.log(e)); // caso dê erro na inicialização
 

/*SESSÕES
R:
O middleware express-session armazena os dados da sessão no servidor; 
ele salva apenas o ID da sessão no cookie, não os dados da sessão. 
Por padrão, ele usa armazenamento em memória e não é projetado para 
um ambiente de produção.

npm install express-session
node index.js
const express = require("express")
const session = require('express-session')
const app = express()
________________________________________________________________________________________________
*/
const session = require('express-session');


/*MONGOSTORE
R:
local em que as sessões são salvas
Pois como são muitos clientes, caso seja salvos em memória
esta será ocupada muito rapidamente
________________________________________________________________________________________________
*/
const MongoStore = require('connect-mongo');


/*FLASH
R:
O flash é uma área especial da sessão usada para armazenar mensagens. 
As mensagens são gravadas no flash e apagadas após serem exibidas ao usuário
________________________________________________________________________________________________
*/
const flash = require('connect-flash');


/*ROUTES
R:
Uma rota em uma API é um “caminho” que será “chamado” por uma aplicação ou cliente e 
responderá alguma informação. Cada rota pode ter uma ou mais funções, e ela deve ser 
única na API, ao receber uma chamada ela faz todo o processamento necessário para retornar 
os dados que foi solicitado
________________________________________________________________________________________________
*/
const routes = require('./routes');


/*PATH
R:
para trabalhar com os caminhos da aplicação
________________________________________________________________________________________________
*/
const path = require('path');


/*HELMET
R:
ajuda você a proteger seus aplicativos Express definindo vários cabeçalhos HTTP.
________________________________________________________________________________________________
*/
const helmet = require('helmet');
app.use(helmet());


/*CSURF TOKEN
R:
Faz com que sites não consigam exportar dados e arquivos para dentro da aplicação
________________________________________________________________________________________________
*/
const csrf = require('csurf');


/*MIDDLEWARES
R:
São funcões executadas no entre a aplicação e o usuário (USUÁRIO + MIDDLEWARES + APP)
________________________________________________________________________________________________
*/
const { middlewareGlobal, outroMiddleware, check_csrf_error, csrfMiddleware } = require('./src/middlewares/middleware');


/*URL ENCODED
R:
A opção "extended" diz para o express qual biblioteca ele 
deve utilizar para fazer o parsing do conteúdo das requisições
que ele recebe.
Quando extended : 
true: vai utilizar a biblioteca qs; 
false: ele vai utilizar a biblioteca querystring

A diferença entre elas é que a biblioteca qs permite o 
aninhamento de objetos (nested objects), que é praticamente 
como o JSON trabalha.
________________________________________________________________________________________________
*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json); //parse com json


/*ARQUIVOS ESTÁTICOS
R:
Para entregar arquivos estáticos como imagens, arquivos CSS, 
e arquivos JavaScript, use a função de middleware 
express.static integrada no Express.

Passe o nome do diretório que contém os ativos estáticos para 
a função de middleware express.static para iniciar a entregar 
os arquivos diretamente. Por exemplo, use o código a seguir 
para entregar imagens, arquivos CSS, e arquivos JavaScript 
em um diretório chamado public

________________________________________________________________________________________________
*/
app.use(express.static(path.resolve(__dirname, 'public')));


/*CONFIGURANDO SESSÕES
________________________________________________________________________________________________
*/
const sessionOptions = session({
    secret: 'senhas_login',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});
app.set(sessionOptions);
app.use(flash());
app.use(csrf());


/*VIEWS
R:
São arquivos renderizados na tela (ejs)
________________________________________________________________________________________________
*/
app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');


/*CONFIGURANDO MIDDLEWARES
________________________________________________________________________________________________
*/
app.use(middlewareGlobal);
app.use(outroMiddleware);
app.use(check_csrf_error);
app.use(csrfMiddleware);
app.use(routes);


/*ESCUTANDO O DB E VS
R:
Ou seja, toda vez que houver uma alteração no código fonte
o app.listen irá atualizar o banco de dados
________________________________________________________________________________________________
*/
app.on('on_mongoDB', () => {
    app.listen(3000, () => {
        //    console.log('Acessar http://localhost:3000')
        console.log('Acessar http://127.0.0.1:3000')
        console.log('servidor executando na porta 3000');
        console.log('\n........................................\n')

    });

});


