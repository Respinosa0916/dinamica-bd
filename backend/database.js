const sqlite3 = require('sqlite3').verbose();

// Usamos una base de datos en memoria para que cada reinicio del servidor esté limpia
const db = new sqlite3.Database(':memory:');

function initDB() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de Clientes
            db.run(`CREATE TABLE clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                pais TEXT NOT NULL,
                fecha_registro DATE
            )`);

            // Tabla de Jugadores (App)
            db.run(`CREATE TABLE jugadores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER DEFAULT 0
            )`);

            // Tabla de Videojuegos
            db.run(`CREATE TABLE videojuegos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                genero TEXT NOT NULL,
                precio REAL NOT NULL,
                stock INTEGER NOT NULL
            )`);

            // Tabla de Compras
            db.run(`CREATE TABLE compras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id INTEGER,
                videojuego_id INTEGER,
                fecha DATE,
                cantidad INTEGER,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id),
                FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id)
            )`);

            // Insertar datos de prueba
            const clientes = [
                ['Juan Perez', 'Colombia', '2023-01-15'],
                ['Maria Garcia', 'Mexico', '2023-02-20'],
                ['Carlos Lopez', 'Argentina', '2023-03-10'],
                ['Ana Martinez', 'Chile', '2023-04-05'],
                ['Luis Fernandez', 'España', '2023-05-12']
            ];
            const stmtClientes = db.prepare(`INSERT INTO clientes (nombre, pais, fecha_registro) VALUES (?, ?, ?)`);
            clientes.forEach(c => stmtClientes.run(c));
            stmtClientes.finalize();

            const juegos = [
                ['The Legend of Zelda', 'Aventura', 59.99, 100],
                ['Super Mario Odyssey', 'Plataformas', 49.99, 150],
                ['Cyberpunk 2077', 'RPG', 29.99, 50],
                ['FIFA 24', 'Deportes', 69.99, 200],
                ['Minecraft', 'Supervivencia', 19.99, 500]
            ];
            const stmtJuegos = db.prepare(`INSERT INTO videojuegos (titulo, genero, precio, stock) VALUES (?, ?, ?, ?)`);
            juegos.forEach(j => stmtJuegos.run(j));
            stmtJuegos.finalize();

            const compras = [
                [1, 1, '2023-06-01', 1],
                [1, 5, '2023-06-05', 2],
                [2, 2, '2023-06-10', 1],
                [3, 3, '2023-06-15', 1],
                [4, 4, '2023-06-20', 1],
                [5, 1, '2023-06-25', 1]
            ];
            const stmtCompras = db.prepare(`INSERT INTO compras (cliente_id, videojuego_id, fecha, cantidad) VALUES (?, ?, ?, ?)`);
            compras.forEach(c => stmtCompras.run(c));
            stmtCompras.finalize();

            console.log("Base de datos SQLite inicializada en memoria.");
            resolve();
        });
    });
}

function runQuery(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function runMutation(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

module.exports = { initDB, runQuery, runMutation };
