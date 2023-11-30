const express = require("express");
const pool = require("./db");
require("dotenv").config();
const basicAuth = require("express-basic-auth");

const app = express();

app.use(express.json());

const password = process.env.SUPERSECRET;

//AUTENTICACION

app.use(
  basicAuth({
    users: { admin: password },
    unauthorizedResponse: getUnauthorizedResponse,
  })
);

function getUnauthorizedResponse(req) {
  return req.auth
    ? "Credentials " + req.auth.user + ":" + req.auth.password + " rejected"
    : "No credentials provided";
}

// VALIDACIONES MIDDLEWARE:

const validateUserInput = (req,res,next) => {
    const { nombre, correo, password, id_pais, fecha_creacion } = req.body;

    if(!nombre || typeof nombre !== 'string' || nombre.length < 3){
        return res.status(400).json({error: "data nombre invalida"})
    }
    if(!correo || typeof correo !== 'string' || correo.length < 3){
        return res.status(400).json({error: "data correo invalida"})
    }
    if(!password || password.length < 5){
        return res.status(400).json({error: "data password invalida"})
    }
    if(!id_pais || typeof id_pais !== 'number' || id_pais.length < 3){
        return res.status(400).json({error: "data id_pais invalida"})
    }
    if(!fecha_creacion || typeof fecha_creacion !== 'string'){
        return res.status(400).json({error: "data fecha_creacion invalida"})
    }

    next();
}

const validateCountryInput = (req,res,next) => {
    const {nombre,activo} = req.body;

    if(!nombre || typeof nombre !== 'string' || nombre.length < 3){
        return res.status(400).json({error: "data nombre invalida"})
    }
    if(!activo || typeof activo !== 'boolean'){
        return res.status(400).json({error: "data activo invalida"})
    }

    next();
}

// RUTAS CRUD:

//HOME

app.get("/", (req, res) => {
    res.send("WELCOME to my API!");
  });

// CREATE

app.post("/usuarios", validateUserInput, async (req, res) => {
  try {
    const { nombre, correo, password, id_pais, fecha_creacion } = req.body;

    const newUser = await pool.query(
      "INSERT INTO usuarios (nombre, correo, password, id_pais, fecha_creacion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, correo, password, id_pais, fecha_creacion]
    );

    res.json(newUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/paises", validateCountryInput, async (req, res) => {
  try {
    const { nombre, activo } = req.body;

    const newCountry = await pool.query(
      "INSERT INTO paises (nombre, activo) VALUES ($1, $2) RETURNING *",
      [nombre, activo]
    );

    res.json(newCountry.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ (all/single)

app.get("/usuarios", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM usuarios");

    res.json(allUsers.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "USER not FOUND!!!" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE

app.put("/usuarios/:id", validateUserInput, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, password, id_pais, fecha_creacion } = req.body;

    const updatedUser = await pool.query(
      "UPDATE usuarios SET nombre = $1, correo = $2, password = $3, id_pais = $4, fecha_creacion = $5 WHERE id = $6",
      [nombre, correo, password, id_pais, fecha_creacion, id]
    );

    if (updatedUser.rowCount === 0) {
      return res.status(404).json({ message: "USER not FOUND!!!" });
    }

    res.json({ message: `user with id ${id} was UPDATED!!!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/paises/:id", validateCountryInput, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    const updatedCountry = await pool.query(
      "UPDATE paises SET nombre = $1, activo = $2 WHERE id = $3",
      [nombre, activo, id]
    );

    if (updatedCountry.rowCount === 0) {
      return res.status(404).json({ message: "country not FOUND!!!" });
    }

    res.json({ message: `country with id ${id} was UPDATED!!!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE

app.delete("/paises/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCountry = await pool.query(
      "DELETE FROM paises WHERE id = $1",
      [id]
    );

    if (deletedCountry.rowCount === 0) {
      return res.status(404).json({ message: "country not FOUND!!!" });
    }

    res.json({ message: `country with id ${id} was DELETED!!!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await pool.query("DELETE FROM usuarios WHERE id = $1", [
      id,
    ]);

    if (deletedUser.rowCount === 0) {
      return res.status(404).json({ message: "user not FOUND!!!" });
    }

    res.json({ message: `user with id ${id} was DELETED!!!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404
app.use('*', (req,res) =>{
    res.json({message: "Route not found!! NOOO!!!"})
})

//CONEXION DB

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
