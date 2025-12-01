require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const getSwaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerSpec = getSwaggerSpec(PORT);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'API RESTful đang hoạt động',
    version: '1.0.0',
    docs: 'http://localhost:' + PORT + '/api-docs'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const initDatabase = require('./database/init');

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

initDatabase().catch(console.error);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route không tồn tại'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Lỗi server nội bộ'
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

