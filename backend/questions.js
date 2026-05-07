const missions = [
    {
        id: 1,
        type: 'theory',
        title: 'Concepto de Base de Datos',
        description: '¿Qué es una base de datos relacional?',
        options: [
            'Un conjunto de datos guardados en archivos de texto plano.',
            'Un tipo de base de datos que almacena y proporciona acceso a puntos de datos relacionados entre sí.',
            'Un programa para hacer presentaciones y diapositivas.',
            'Un lugar físico donde se guardan servidores.'
        ],
        correctOptionIndex: 1
    },
    {
        id: 2,
        type: 'theory',
        title: 'Modelo Entidad-Relación (DER)',
        description: 'En un diagrama Entidad-Relación, ¿qué representa un rectángulo?',
        options: [
            'Una relación',
            'Un atributo',
            'Una entidad',
            'Una clave primaria'
        ],
        correctOptionIndex: 2
    },
    {
        id: 3,
        type: 'sql',
        title: 'Tu primera consulta (SELECT)',
        description: 'Escribe una consulta SQL para seleccionar todos los registros de la tabla "videojuegos".',
        expectedSql: 'SELECT * FROM videojuegos' // El sistema correrá la consulta del alumno y la esperada, y comparará los resultados.
    },
    {
        id: 4,
        type: 'sql',
        title: 'Filtrando datos (WHERE)',
        description: 'Selecciona el titulo y el precio de los videojuegos que cuesten menos de 50.00.',
        expectedSql: 'SELECT titulo, precio FROM videojuegos WHERE precio < 50.00'
    },
    {
        id: 5,
        type: 'sql',
        title: 'Agrupando datos (GROUP BY)',
        description: 'Muestra cuántos videojuegos hay de cada género. Retorna "genero" y el número de juegos (usa COUNT(*)).',
        expectedSql: 'SELECT genero, COUNT(*) FROM videojuegos GROUP BY genero'
    },
    {
        id: 6,
        type: 'sql',
        title: 'Uniendo tablas (JOIN)',
        description: 'Obtén el nombre del cliente y el título del videojuego que ha comprado. Relaciona clientes, compras y videojuegos.',
        expectedSql: 'SELECT c.nombre, v.titulo FROM clientes c JOIN compras co ON c.id = co.cliente_id JOIN videojuegos v ON co.videojuego_id = v.id'
    },
    {
        id: 7,
        type: 'sql',
        title: 'Ordenando resultados (ORDER BY)',
        description: 'Selecciona todos los clientes y ordénalos por país de forma alfabética (ascendente).',
        expectedSql: 'SELECT * FROM clientes ORDER BY pais ASC'
    },
    {
        id: 8,
        type: 'theory',
        title: 'Funciones de Agregación',
        description: '¿Cuál de las siguientes NO es una función de agregación estándar en SQL?',
        options: [
            'SUM()',
            'COUNT()',
            'AVERAGE()',
            'MAX()'
        ],
        correctOptionIndex: 2
    },
    {
        id: 9,
        type: 'sql',
        title: 'Búsqueda por Patrones (LIKE)',
        description: 'Encuentra todos los videojuegos cuyo título empiece con la letra "S". Selecciona el título.',
        expectedSql: "SELECT titulo FROM videojuegos WHERE titulo LIKE 'S%'"
    },
    {
        id: 10,
        type: 'sql',
        title: 'Múltiples Condiciones (IN)',
        description: 'Selecciona los clientes que sean de "Colombia" o "Mexico" usando la cláusula IN.',
        expectedSql: "SELECT * FROM clientes WHERE pais IN ('Colombia', 'Mexico')"
    },
    {
        id: 11,
        type: 'sql',
        title: 'Subconsultas Avanzadas',
        description: 'Selecciona el título del videojuego que tiene el precio más alto usando una subconsulta.',
        expectedSql: "SELECT titulo FROM videojuegos WHERE precio = (SELECT MAX(precio) FROM videojuegos)"
    }
];

module.exports = missions;
