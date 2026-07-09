import bcrypt from 'bcryptjs';
import pool, { consultar } from './src/datos/conexion.js';

const clientesDemo = [
  {
    numeroCliente: '73193206',
    dni: '72458913',
    contrasena: 'MRjhey10',
    nombre: 'Nicole Valderrama Bravo',
    telefono: '+51 942231107',
    correo: 'jheymybm@gmail.com',
    servicios: [
      { nombre: 'Internet Fibra 300 Mbps', estado: 'Activo' },
      { nombre: 'WIN TV Plus', estado: 'Activo' }
    ],
    notificaciones: [
      { mensaje: 'Tu recibo de Junio ha sido facturado con éxito.', leida: false },
      { mensaje: 'Mantenimiento programado en tu zona para el 15/07/2026.', leida: false },
      { mensaje: '¡Bienvenido a tu nuevo portal de autogestión!', leida: true }
    ]
  },
  {
    numeroCliente: '88888888',
    dni: '70112233',
    contrasena: 'win2026',
    nombre: 'Inés Valderrama',
    telefono: '+51 912 345 678',
    correo: 'ines.valderrama@email.com',
    servicios: [
      { nombre: 'Internet Fibra 500 Mbps', estado: 'Activo' }
    ],
    notificaciones: []
  }
];

const adminDemo = {
  usuario: 'admin',
  contrasena: 'admin2026',
  nombre: 'Administrador WIN'
};

const sembrar = async () => {
  try {
    console.log('Sembrando datos de demostración...');

    await consultar('DELETE FROM clientes');

    await consultar('DELETE FROM administradores');
    const adminHash = await bcrypt.hash(adminDemo.contrasena, 10);
    await consultar(
      'INSERT INTO administradores (usuario, contrasena_hash, nombre) VALUES (?, ?, ?)',
      [adminDemo.usuario, adminHash, adminDemo.nombre]
    );
    console.log(`  ✔ Administrador "${adminDemo.usuario}" insertado.`);

    for (const cliente of clientesDemo) {
      const contrasenaHash = await bcrypt.hash(cliente.contrasena, 10);

      await consultar(
        `INSERT INTO clientes (numero_cliente, dni, contrasena_hash, nombre, telefono, correo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cliente.numeroCliente, cliente.dni, contrasenaHash, cliente.nombre, cliente.telefono, cliente.correo]
      );

      for (const servicio of cliente.servicios) {
        await consultar(
          `INSERT INTO servicios (numero_cliente, nombre, estado) VALUES (?, ?, ?)`,
          [cliente.numeroCliente, servicio.nombre, servicio.estado]
        );
      }

      for (const notificacion of cliente.notificaciones) {
        await consultar(
          `INSERT INTO notificaciones (numero_cliente, mensaje, leida) VALUES (?, ?, ?)`,
          [cliente.numeroCliente, notificacion.mensaje, notificacion.leida]
        );
      }

      console.log(`  ✔ Cliente ${cliente.numeroCliente} (${cliente.nombre}) insertado.`);
    }

    console.log('\nSiembra completada con éxito.');
    console.log('Credenciales de demostración:');
    console.log('  N° Cliente: 73193206   Contraseña: MRjhey10');
    console.log('  N° Cliente: 88888888   Contraseña: win2026');
    console.log('  Admin -> usuario: admin   Contraseña: admin2026');
  } catch (error) {
    console.error('Error durante la siembra:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

sembrar();
