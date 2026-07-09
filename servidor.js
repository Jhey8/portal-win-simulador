import dotenv from 'dotenv';
import aplicacion from './src/aplicacion.js';
import { inicializarBaseDatos } from './src/datos/inicializar.js';

dotenv.config();

const puerto = process.env.PORT || process.env.PUERTO || 3000;

const iniciar = async () => {
  try {
    await inicializarBaseDatos();
  } catch (error) {
    console.error('No se pudo inicializar la base de datos:', error.message);
  }

  aplicacion.listen(puerto, () => {
    console.log('================================================================');
    console.log('   Portal de Autogestión de WIN Internet corriendo con éxito    ');
    console.log(`   Servidor local iniciado en el puerto: ${puerto}              `);
    console.log('================================================================');
  });
};

iniciar();
