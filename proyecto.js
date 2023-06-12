const Koa = require('koa'); // Importa el framework Koa
const Router = require('@koa/router'); // Importa el enrutador de Koa
const bodyParser = require('koa-bodyparser'); // Importa el middleware para procesar el cuerpo de las solicitudes HTTP
const multer = require('@koa/multer'); // Importa el middleware para procesar archivos adjuntos en las solicitudes HTTP
const serve = require('koa-static'); // Importa el middleware para servir archivos estáticos
const fs = require('fs'); // Importa la biblioteca de manejo de archivos del sistema

const app = new Koa(); // Crea una nueva instancia de la aplicación Koa
const router = new Router(); // Crea una nueva instancia del enrutador de Koa
const upload = multer({ dest: 'uploads/' }); // Crea una nueva instancia del middleware de procesamiento de archivos adjuntos y configura el directorio de almacenamiento
const path = require('path')
const render = require('koa-ejs')

let usuarios = []; // Arreglo para almacenar la información de los usuarios
let publicaciones = []; // Arreglo para almacenar la información de las publicaciones
let idPublicacion = 1; // Variable para asignar un id único a cada publicación


// Endpoint para agregar un nuevo usuario
router.post('/usuarios', (ctx) => {
  const usuario = ctx.request.body; // Obtener el cuerpo de la solicitud HTTP
  usuarios.push(usuario); // Agregar el usuario al arreglo de usuarios
  ctx.status = 201; // Establecer el código de estado HTTP de respuesta a "Creado"
  ctx.body = usuario; // Establecer el cuerpo de la respuesta HTTP como el usuario creado
});


// Endpoint para obtener la información de todos los usuarios
router.get('/usuarios', (ctx) => {
    const usuariosString = usuarios.map(usuario => `${usuario.nombre} ${usuario.apellido} - ${usuario.email}`).join('\n');
    ctx.body = usuariosString; // Establecer el cuerpo de la respuesta HTTP como la cadena de usuarios separados por un salto de línea
  });

// Para obtener la información de la página principal html
router.get('/index', (ctx) => {
  const html = fs.readFileSync('homepage.html', 'utf8');
  ctx.body = html;
});

router.get('/test', async ctx => ctx.body = 'This is comin')

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
})

// Endpoint para crear una nueva publicación
router.post('/publicaciones', upload.single('imagen'), (ctx) => {
  const { texto } = ctx.request.body; // Obtener el cuerpo de la solicitud HTTP
  const imagen = ctx.file ? fs.readFileSync(ctx.file.path) : null; // Leer el archivo adjunto y almacenar la imagen
  const publicacion = {
    id: idPublicacion++, // Asignar un id único a la publicación y aumentar el contador para la próxima publicación
    texto,
    imagen,
    comentarios: [], // Inicializar el arreglo de comentarios vacío
  };
  publicaciones.push(publicacion); // Agregar la publicación al arreglo de publicaciones
  ctx.status = 201; // Establecer el código de estado HTTP de respuesta a "Creado"
  ctx.body = publicacion; // Establecer el cuerpo de la respuesta HTTP como la publicación creada
});

// Endpoint para obtener la información de todas las publicaciones
router.get('/publicaciones', (ctx) => {
  ctx.body = publicaciones; // Establecer el cuerpo de la respuesta HTTP como el arreglo de publicaciones
});

// Endpoint para agregar un nuevo comentario a una publicación
router.post('/publicaciones/:id/comentarios', (ctx) => {
  // Se busca la publicación en el arreglo de publicaciones usando el ID que viene en los parámetros de la solicitud
  const publicacion = publicaciones.find((p) => p.id === parseInt(ctx.params.id));
  // Si no se encuentra la publicación, se establece el estado de la respuesta a 404 y se devuelve un objeto JSON con un mensaje de error
  if (!publicacion) {
    ctx.status = 404;
    ctx.body = { error: 'Publicación no encontrada' };
    return;
  }
  // Si se encuentra la publicación, se extraen los valores de autor y texto de la solicitud y se crea un nuevo objeto de comentario
  const { autor, texto } = ctx.request.body;
  const comentario = { autor, texto };
  // Se agrega el nuevo comentario al arreglo de comentarios de la publicación y se establece el estado de la respuesta a 201 (creado)
  publicacion.comentarios.push(comentario);
  ctx.status = 201;
  // Se devuelve el objeto de comentario creado en la respuesta
  ctx.body = comentario;
});


//Index
router.get('/', async ctx => {
  await ctx.render('index');
})

// Middleware de manejo de errores
app.use(async (ctx, next) => {
  try {
    await next();
    // Si el estado de la respuesta es 404, se lanza una excepción con un mensaje personalizado
    if (ctx.status === 404) {
      ctx.throw(404, 'El recurso solicitado no existe');
    }
  } catch (err) {
    // Si ocurre un error, se establece el estado de la respuesta a un valor predeterminado (500) y se devuelve un objeto JSON con un mensaje de error
    ctx.status = err.status || 500;
    ctx.body = { message: err.message };
  }
});

// Servir archivos estáticos
app.use(serve('./images'));

// Configurar el middleware estático para servir archivos CSS
app.use(serve(__dirname + '/images'));


// Se utiliza el middleware "bodyParser" para procesar los datos de solicitud en formato JSON
app.use(bodyParser());
// Se utilizan los enrutadores y métodos permitidos por el enrutador
app.use(router.routes());
app.use(router.allowedMethods());

// Se inicia el servidor en el puerto 3000 y se muestra un mensaje en la consola
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});


// Creación de usuarios de prueba

const admin = {
    nombre: "Admin",
    apellido: "Admin",
    email: "admin@example.com",
    password: "admin",
    admin: true // Establecer el campo "admin" en true
  };
  usuarios.push(admin); // Agregar el usuario admin al arreglo de usuarios




const nuevoUsuario = {
    nombre: "Jorje",
    apellido: "Pérez",
    email: "jorje.elcurioso@example.com",
    password: "clave123",
    admin: false // En caso de que este usuario no sea un administrador
  };
  
  usuarios.push(nuevoUsuario); // Agregar el nuevo usuario al arreglo de usuarios